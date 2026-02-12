import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/products.entity';
import { OrderItem } from '../order-items/order-items.entity';
import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        private readonly dataSource: DataSource,
    ) { }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepo.find({ relations: ['items', 'items.product', 'user'] });
    }

    async getOrders(
        filter?: { status?: Order['status']; dateFrom?: Date; dateTo?: Date },
        pagination?: { limit?: number; offset?: number },
    ): Promise<Order[]> {
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.user', 'user');

        if (filter?.status) {
            qb.andWhere('order.status = :status', { status: filter.status });
        }

        if (filter?.dateFrom) {
            qb.andWhere('order.createdAt >= :dateFrom', { dateFrom: filter.dateFrom });
        }

        if (filter?.dateTo) {
            qb.andWhere('order.createdAt <= :dateTo', { dateTo: filter.dateTo });
        }

        if (pagination?.limit !== undefined) {
            qb.take(pagination.limit);
        }

        if (pagination?.offset !== undefined) {
            qb.skip(pagination.offset);
        }

        return qb.getMany();
    }
    async getOrdersConnection(
        filter?: { status?: Order['status']; dateFrom?: Date; dateTo?: Date },
        pagination?: { limit?: number; offset?: number },
    ): Promise<{
        nodes: Order[];
        totalCount: number;
        pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor?: string;
            endCursor?: string;
        };
    }> {
        const limit = pagination?.limit ?? 10;
        const offset = pagination?.offset ?? 0;

        // Будуємо QueryBuilder для розрахунку загальної кількості
        const countQb = this.orderRepo.createQueryBuilder('order');

        if (filter?.status) {
            countQb.andWhere('order.status = :status', { status: filter.status });
        }

        if (filter?.dateFrom) {
            countQb.andWhere('order.createdAt >= :dateFrom', { dateFrom: filter.dateFrom });
        }

        if (filter?.dateTo) {
            countQb.andWhere('order.createdAt <= :dateTo', { dateTo: filter.dateTo });
        }

        const totalCount = await countQb.getCount();

        // Отримуємо дані з пагінацією
        const nodes = await this.getOrders(filter, pagination);

        // Визначаємо pageInfo
        const hasNextPage = offset + limit < totalCount;
        const hasPreviousPage = offset > 0;

        const startCursor = nodes.length > 0 ? Buffer.from(`offset:${offset}`).toString('base64') : undefined;
        const endCursor = nodes.length > 0 ? Buffer.from(`offset:${offset + nodes.length}`).toString('base64') : undefined;

        return {
            nodes,
            totalCount,
            pageInfo: {
                hasNextPage,
                hasPreviousPage,
                startCursor,
                endCursor,
            },
        };
    }
    async getOrderById(id: number): Promise<Order> {
        const order = await this.orderRepo.findOne({ where: { id }, relations: ['items', 'items.product', 'user'] });
        if (!order) throw new NotFoundException(`Order ${id} not found`);
        return order;
    }

    async createOrder(dto: {
        userId: number;
        items: { productId: number; quantity: number }[];
        idempotencyKey?: string;
    }): Promise<Order> {
        const idempotencyKey = dto.idempotencyKey || uuidv4();

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Перевірка на існуюче замовлення
            const existingOrder = await queryRunner.manager.findOne(Order, {
                where: { idempotencyKey },
                relations: ['items', 'items.product', 'user'],
            });
            if (existingOrder) {
                // транзакція не створює нових даних, просто повертаємо існуюче замовлення
                await queryRunner.rollbackTransaction();
                return existingOrder; // NestJS віддасть 200 OK
            }

            // 2. Перевірка користувача
            const user = await queryRunner.manager.findOneBy(User, { id: dto.userId });
            if (!user) throw new BadRequestException('User not found');

            // 3. Створення замовлення
            let total = 0;
            const order = queryRunner.manager.create(Order, { user, total: 0, idempotencyKey });
            await queryRunner.manager.save(order);

            // 4. Додавання товарів + оновлення складу
            const items: OrderItem[] = [];
            for (const item of dto.items) {
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: item.productId },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!product) throw new BadRequestException(`Product ${item.productId} not found`);

                if (product.stock < item.quantity) {
                    // бізнес-помилка → 409 Conflict
                    throw new ConflictException(`Not enough stock for product ${product.id}`);
                }

                product.stock -= item.quantity;
                await queryRunner.manager.save(product);

                const price = product.price * item.quantity;
                total += price;

                items.push(
                    queryRunner.manager.create(OrderItem, {
                        order,
                        product,
                        quantity: item.quantity,
                        price,
                    }),
                );
            }

            await queryRunner.manager.save(items);

            // 5. Оновлення total
            order.total = total;
            await queryRunner.manager.save(order);

            // 6. Commit
            await queryRunner.commitTransaction();

            // 7. Повертаємо замовлення з усіма зв’язками
            const savedOrder = await this.orderRepo.findOne({
                where: { id: order.id },
                relations: ['items', 'items.product', 'user'],
            });
            if (!savedOrder) throw new NotFoundException(`Order ${order.id} not found after creation`);

            return savedOrder;
        } catch (err) {
            await queryRunner.rollbackTransaction();

            // бізнес-помилки повертаємо як є
            if (err instanceof ConflictException || err instanceof BadRequestException) {
                throw err;
            }

            // інші → 500 Internal Server Error
            throw new InternalServerErrorException('Unexpected error occurred');
        } finally {
            await queryRunner.release();
        }
    }


    async updateOrder(id: number, dto: Partial<Order>): Promise<Order> {
        await this.orderRepo.update(id, dto);
        return this.getOrderById(id);
    }

    async deleteOrder(id: number): Promise<void> {
        const result = await this.orderRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Order ${id} not found`);
    }
}
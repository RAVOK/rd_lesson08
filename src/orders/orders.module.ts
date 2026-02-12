import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/products.entity';
import { OrderItem } from '../order-items/order-items.entity';
import { OrdersResolver } from './orders.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Product, OrderItem]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
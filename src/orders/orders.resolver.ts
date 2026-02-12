import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { OrderType } from '../graphQL/types/order.type';
import { OrdersFilterInput } from '../graphQL/types/orders-filter.input';
import { OrdersPaginationInput } from '../graphQL/types/orders-pagination.input';
import { OrdersConnection } from '../graphQL/types/orders-connection.type';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) { }

  @Query(() => [OrderType], { description: 'Отримати список усіх замовлень' })
  orders(
    @Args('filter', { type: () => OrdersFilterInput, nullable: true })
    filter?: OrdersFilterInput,
    @Args('pagination', { type: () => OrdersPaginationInput, nullable: true })
    pagination?: OrdersPaginationInput,
  ): Promise<Order[]> {
    return this.ordersService.getOrders(filter, pagination);
  }

  @Query(() => OrdersConnection, { description: 'Отримати замовлення з пагінацією (Connection Pattern)' })
  ordersConnection(
    @Args('filter', { type: () => OrdersFilterInput, nullable: true })
    filter?: OrdersFilterInput,
    @Args('pagination', { type: () => OrdersPaginationInput, nullable: true })
    pagination?: OrdersPaginationInput,
  ): Promise<OrdersConnection> {
    return this.ordersService.getOrdersConnection(filter, pagination);
  }

  @Query(() => OrderType, {
    name: 'order',
    nullable: true,
    description: 'Отримати замовлення за ID',
  })
  orderById(@Args('id', { type: () => Int }) id: number): Promise<Order | null> {
    return this.ordersService.getOrderById(id);
  }
}


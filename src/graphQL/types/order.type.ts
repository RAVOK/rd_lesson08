import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { OrderItemType } from './order-item.type';
import { OrderStatus } from '../../orders/orders.entity';

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType('Order')
export class OrderType {
  @Field(() => ID)
  id: number;

  @Field(() => UserType, { nullable: true })
  user: UserType | null;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field()
  total: number;

  @Field()
  idempotencyKey: string;

  @Field()
  customerName: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}


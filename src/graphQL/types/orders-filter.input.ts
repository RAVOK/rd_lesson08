import { Field, InputType } from '@nestjs/graphql';
import { OrderStatus } from '../../orders/orders.entity';

@InputType('OrdersFilterInput')
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field({ nullable: true })
  dateFrom?: Date;

  @Field({ nullable: true })
  dateTo?: Date;
}


import { Field, ObjectType, Int } from '@nestjs/graphql';
import { OrderType } from './order.type';

@ObjectType('PageInfo')
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType('OrdersConnection')
export class OrdersConnection {
  @Field(() => [OrderType])
  nodes: OrderType[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrderType } from './order.type';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => [OrderType])
  orders: OrderType[];
}


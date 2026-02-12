import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProductType } from './product.type';

@ObjectType('OrderItem')
export class OrderItemType {
  @Field(() => ID)
  id: number;

  @Field()
  quantity: number;

  @Field()
  price: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => ProductType)
  product: ProductType;
}


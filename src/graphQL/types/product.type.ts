import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Product')
export class ProductType {
  @Field(() => ID)
  id: number;

  @Field(() => String, { name: 'title' })
  name: string;

  @Field()
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}


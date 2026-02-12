import { Field, InputType, Int } from '@nestjs/graphql';

@InputType('OrdersPaginationInput')
export class OrdersPaginationInput {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}


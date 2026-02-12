import { Field, InputType } from '@nestjs/graphql';
import { OrderStatus } from '../../orders/orders.entity';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';

@InputType('OrdersFilterInput')
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { OrderItem } from '../order-items/order-items.entity';
import { OrderItemType } from '../graphQL/types/order-item.type';
import { ProductType } from '../graphQL/types/product.type';



@Resolver(() => OrderItemType)
export class OrderItemsResolver {
  @ResolveField(() => ProductType, { nullable: true })
  product(@Parent() item: OrderItem, @Context() ctx) {
    const productId = (item as any).product?.id;
    if (!productId) return null;
    return ctx.loaders.productLoader.load(productId);
  }
}
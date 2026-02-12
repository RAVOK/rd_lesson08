import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { Product } from '../products/products.entity';

export const createProductLoader = (productRepo: Repository<Product>) =>
  new DataLoader<number, Product | null>(async (keys: readonly number[]) => {
    const ids = Array.from(new Set(keys as number[]));
    const products = await productRepo.find({ where: { id: In(ids) } });
    const map = new Map(products.map(p => [p.id, p]));
    return keys.map(k => map.get(k as number) ?? null);
  });
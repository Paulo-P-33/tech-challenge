import type { Product } from '../../../core/products/product.entity';

export function presentProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

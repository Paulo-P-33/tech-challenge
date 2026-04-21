import type { Product, ProductId } from './product.entity';

export interface ProductsRepository {
  findById(id: ProductId): Promise<Product | null>;
  list(): Promise<Product[]>;
  create(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
}

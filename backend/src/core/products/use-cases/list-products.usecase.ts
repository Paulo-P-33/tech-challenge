import type { Product } from '../product.entity';
import type { ProductsRepository } from '../products.repository';

export class ListProductsUseCase {
  constructor(private readonly repo: ProductsRepository) {}

  async execute(): Promise<Product[]> {
    return this.repo.list();
  }
}

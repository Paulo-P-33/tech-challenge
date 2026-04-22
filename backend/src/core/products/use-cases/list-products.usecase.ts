import type { Paginated, PaginationParams } from '../../shared/pagination';
import type { Product } from '../product.entity';
import type { ProductsRepository } from '../products.repository';

export class ListProductsUseCase {
  constructor(private readonly repo: ProductsRepository) {}

  async execute(pagination: PaginationParams): Promise<Paginated<Product>> {
    return this.repo.list(pagination);
  }
}

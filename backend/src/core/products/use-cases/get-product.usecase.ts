import { NotFoundError } from '../../shared/errors';
import type { Product, ProductId } from '../product.entity';
import type { ProductsRepository } from '../products.repository';

export class GetProductUseCase {
  constructor(private readonly repo: ProductsRepository) {}

  async execute(id: ProductId): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }
}

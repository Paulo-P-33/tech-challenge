import { NotFoundError } from '../../shared/errors';
import type { ProductsRepository } from '../products.repository';
import type { ProductId } from '../product.entity';

export class DeleteProductUseCase {
  constructor(private readonly repo: ProductsRepository) {}

  async execute(id: ProductId): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Product not found');
    await this.repo.delete(id);
  }
}


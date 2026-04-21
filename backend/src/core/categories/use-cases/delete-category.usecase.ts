import { NotFoundError } from '../../shared/errors';
import type { CategoryId } from '../category.entity';
import type { CategoriesRepository } from '../categories.repository';

export class DeleteCategoryUseCase {
  constructor(private readonly repo: CategoriesRepository) {}

  async execute(id: CategoryId): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Category not found');
    await this.repo.delete(id);
  }
}


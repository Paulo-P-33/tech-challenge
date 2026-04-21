import { NotFoundError } from '../../shared/errors';
import type { CategoriesRepository } from '../categories.repository';
import type { Category, CategoryId } from '../category.entity';

export class GetCategoryUseCase {
  constructor(private readonly repo: CategoriesRepository) {}

  async execute(id: CategoryId): Promise<Category> {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }
}

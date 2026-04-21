import type { CategoriesRepository } from '../categories.repository';
import type { Category } from '../category.entity';

export class ListCategoriesUseCase {
  constructor(private readonly repo: CategoriesRepository) {}

  async execute(): Promise<Category[]> {
    return this.repo.list();
  }
}

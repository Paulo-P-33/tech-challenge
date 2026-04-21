import type { Category } from '../category.entity';
import type { CategoriesRepository } from '../categories.repository';

export class ListCategoriesUseCase {
  constructor(private readonly repo: CategoriesRepository) {}

  async execute(): Promise<Category[]> {
    return this.repo.list();
  }
}


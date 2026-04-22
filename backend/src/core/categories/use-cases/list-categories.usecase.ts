import type { Paginated, PaginationParams } from '../../shared/pagination';
import type { CategoriesRepository } from '../categories.repository';
import type { Category } from '../category.entity';

export class ListCategoriesUseCase {
  constructor(private readonly repo: CategoriesRepository) {}

  async execute(pagination: PaginationParams): Promise<Paginated<Category>> {
    return this.repo.list(pagination);
  }
}

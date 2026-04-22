import type { Paginated, PaginationParams } from '../shared/pagination';

import type { Category, CategoryId } from './category.entity';

export interface CategoriesRepository {
  findById(id: CategoryId): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  list(pagination: PaginationParams): Promise<Paginated<Category>>;
  create(category: Category): Promise<void>;
  delete(id: CategoryId): Promise<void>;
}

import type { Category, CategoryId } from './category.entity';

export interface CategoriesRepository {
  findById(id: CategoryId): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  list(): Promise<Category[]>;
  create(category: Category): Promise<void>;
  delete(id: CategoryId): Promise<void>;
}

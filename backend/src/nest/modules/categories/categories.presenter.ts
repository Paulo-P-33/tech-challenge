import type { Category } from '../../../core/categories/category.entity';

export function presentCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

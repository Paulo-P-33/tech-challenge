import type { CategoriesRepository } from '../../../core/categories/categories.repository';
import type {
  Category,
  CategoryId,
} from '../../../core/categories/category.entity';
import type {
  Paginated,
  PaginationParams,
} from '../../../core/shared/pagination';

export class CategoriesMemoryRepository implements CategoriesRepository {
  private readonly items = new Map<CategoryId, Category>();

  async findById(id: CategoryId): Promise<Category | null> {
    return this.items.get(id) ?? null;
  }

  async findByName(name: string): Promise<Category | null> {
    const normalized = name.trim().toLowerCase();
    for (const category of this.items.values()) {
      if (category.name.toLowerCase() === normalized) return category;
    }
    return null;
  }

  async list({ page, limit }: PaginationParams): Promise<Paginated<Category>> {
    const all = Array.from(this.items.values());
    const skip = (page - 1) * limit;
    return {
      data: all.slice(skip, skip + limit),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit),
    };
  }

  async create(category: Category): Promise<void> {
    this.items.set(category.id, category);
  }

  async delete(id: CategoryId): Promise<void> {
    this.items.delete(id);
  }
}

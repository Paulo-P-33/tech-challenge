import type { Product, ProductId } from '../../../core/products/product.entity';
import type { ProductsRepository } from '../../../core/products/products.repository';
import type {
  Paginated,
  PaginationParams,
} from '../../../core/shared/pagination';

export class ProductsMemoryRepository implements ProductsRepository {
  private readonly items = new Map<ProductId, Product>();

  async findById(id: ProductId): Promise<Product | null> {
    return this.items.get(id) ?? null;
  }

  async list({ page, limit }: PaginationParams): Promise<Paginated<Product>> {
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

  async create(product: Product): Promise<void> {
    this.items.set(product.id, product);
  }

  async save(product: Product): Promise<void> {
    this.items.set(product.id, product);
  }

  async delete(id: ProductId): Promise<void> {
    this.items.delete(id);
  }
}

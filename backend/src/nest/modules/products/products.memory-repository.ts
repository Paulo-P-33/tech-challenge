import type { Product, ProductId } from '../../../core/products/product.entity';
import type { ProductsRepository } from '../../../core/products/products.repository';

export class ProductsMemoryRepository implements ProductsRepository {
  private readonly items = new Map<ProductId, Product>();

  async findById(id: ProductId): Promise<Product | null> {
    return this.items.get(id) ?? null;
  }

  async list(): Promise<Product[]> {
    return Array.from(this.items.values());
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

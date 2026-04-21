import { NotFoundError } from '../../shared/errors';
import type { Clock } from '../../shared/clock';
import type { IdGenerator } from '../../shared/id';
import type { CategoriesRepository } from '../../categories/categories.repository';
import { Product, type Money } from '../product.entity';
import type { ProductsRepository } from '../products.repository';

export interface CreateProductInput {
  name: string;
  categoryId: string;
  price: Money;
}

export class CreateProductUseCase {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly categoriesRepo: CategoriesRepository,
    private readonly id: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const category = await this.categoriesRepo.findById(input.categoryId);
    if (!category) throw new NotFoundError('Category not found');

    const now = this.clock();
    const product = Product.create({
      id: this.id(),
      name: input.name,
      categoryId: input.categoryId,
      price: input.price,
      createdAt: now,
      updatedAt: now,
    });

    await this.productsRepo.create(product);
    return product;
  }
}


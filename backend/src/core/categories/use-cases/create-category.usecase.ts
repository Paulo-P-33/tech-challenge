import type { Clock } from '../../shared/clock';
import { ConflictError } from '../../shared/errors';
import type { IdGenerator } from '../../shared/id';
import type { CategoriesRepository } from '../categories.repository';
import { Category } from '../category.entity';

export interface CreateCategoryInput {
  name: string;
}

export class CreateCategoryUseCase {
  constructor(
    private readonly repo: CategoriesRepository,
    private readonly id: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const existing = await this.repo.findByName(input.name);
    if (existing)
      throw new ConflictError('Category with this name already exists');

    const now = this.clock();
    const category = Category.create({
      id: this.id(),
      name: input.name,
      createdAt: now,
      updatedAt: now,
    });

    await this.repo.create(category);
    return category;
  }
}

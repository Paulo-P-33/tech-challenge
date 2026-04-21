import { ConflictError } from '../../shared/errors';
import type { Clock } from '../../shared/clock';
import type { IdGenerator } from '../../shared/id';
import { Category } from '../category.entity';
import type { CategoriesRepository } from '../categories.repository';

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
    if (existing) throw new ConflictError('Category with this name already exists');

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


import { Injectable } from '@nestjs/common';

import { CategoriesRepository } from '../../../core/categories/categories.repository';
import { Category, CategoryId } from '../../../core/categories/category.entity';

import { PrismaService } from './prisma.service';

@Injectable()
export class CategoriesPrismaRepository implements CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: CategoryId): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row) return null;
    return Category.create(row);
  }

  async findByName(name: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { name } });
    if (!row) return null;
    return Category.create(row);
  }

  async list(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany();
    return rows.map((row) => Category.create(row));
  }

  async create(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  }

  async delete(id: CategoryId): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}

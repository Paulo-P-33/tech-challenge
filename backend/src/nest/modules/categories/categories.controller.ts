import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';
import { z } from 'zod';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { CreateCategoryUseCase } from '../../../core/categories/use-cases/create-category.usecase';
import { DeleteCategoryUseCase } from '../../../core/categories/use-cases/delete-category.usecase';
import { GetCategoryUseCase } from '../../../core/categories/use-cases/get-category.usecase';
import { ListCategoriesUseCase } from '../../../core/categories/use-cases/list-categories.usecase';
import { presentCategory } from './categories.presenter';

const createCategoryBodySchema = z.object({
  name: z.string().min(1),
});

@UseFilters(DomainExceptionFilter)
@Controller('/categories')
export class CategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly getCategory: GetCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Get()
  async list() {
    const categories = await this.listCategories.execute();
    return categories.map(presentCategory);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const category = await this.getCategory.execute(id);
    return presentCategory(category);
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = createCategoryBodySchema.parse(body);
    const category = await this.createCategory.execute(input);
    return presentCategory(category);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteCategory.execute(id);
    return { ok: true };
  }
}


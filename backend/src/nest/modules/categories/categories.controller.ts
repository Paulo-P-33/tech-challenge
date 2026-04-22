import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';

import { CreateCategoryUseCase } from '../../../core/categories/use-cases/create-category.usecase';
import { DeleteCategoryUseCase } from '../../../core/categories/use-cases/delete-category.usecase';
import { GetCategoryUseCase } from '../../../core/categories/use-cases/get-category.usecase';
import { ListCategoriesUseCase } from '../../../core/categories/use-cases/list-categories.usecase';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentCategory } from './categories.presenter';

const createCategoryBodySchema = z.object({
  name: z.string().min(1),
});

const categorySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Categories')
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
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias',
    schema: { type: 'array', items: categorySchema },
  })
  async list() {
    const categories = await this.listCategories.execute();
    return categories.map(presentCategory);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Dados da categoria', schema: categorySchema })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async get(@Param('id') id: string) {
    const category = await this.getCategory.execute(id);
    return presentCategory(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar categoria (autenticado)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Eletrônicos' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Categoria criada', schema: categorySchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 409, description: 'Categoria já existe' })
  async create(@Body() body: unknown) {
    const input = createCategoryBodySchema.parse(body);
    const category = await this.createCategory.execute(input);
    return presentCategory(category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover categoria (autenticado)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria removida', schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async delete(@Param('id') id: string) {
    await this.deleteCategory.execute(id);
    return { ok: true };
  }
}

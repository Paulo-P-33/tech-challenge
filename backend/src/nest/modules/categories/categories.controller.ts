import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

import { CreateCategoryUseCase } from '../../../core/categories/use-cases/create-category.usecase';
import { DeleteCategoryUseCase } from '../../../core/categories/use-cases/delete-category.usecase';
import { GetCategoryUseCase } from '../../../core/categories/use-cases/get-category.usecase';
import { ListCategoriesUseCase } from '../../../core/categories/use-cases/list-categories.usecase';
import { Audit } from '../../shared/audit.decorator';
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
@ApiBearerAuth()
@UseFilters(DomainExceptionFilter)
@UseGuards(JwtAuthGuard)
@Controller('/categories')
export class CategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly getCategory: GetCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Get()
  @Audit('CATEGORY_LIST')
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de categorias',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: categorySchema },
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  })
  async list(@Query() query: unknown) {
    const { page, limit } = paginationQuerySchema.parse(query);
    const result = await this.listCategories.execute({ page, limit });
    return { ...result, data: result.data.map(presentCategory) };
  }

  @Get(':id')
  @Audit('CATEGORY_VIEWED', 'category')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da categoria' })
  @ApiResponse({
    status: 200,
    description: 'Dados da categoria',
    schema: categorySchema,
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async get(@Param('id') id: string) {
    const category = await this.getCategory.execute(id);
    return presentCategory(category);
  }

  @Post()
  @Audit('CATEGORY_CREATED', 'category')
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
  @ApiResponse({
    status: 201,
    description: 'Categoria criada',
    schema: categorySchema,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 409, description: 'Categoria já existe' })
  async create(@Body() body: unknown) {
    const input = createCategoryBodySchema.parse(body);
    const category = await this.createCategory.execute(input);
    return presentCategory(category);
  }

  @Delete(':id')
  @Audit('CATEGORY_DELETED', 'category')
  @ApiOperation({ summary: 'Remover categoria (autenticado)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da categoria' })
  @ApiResponse({
    status: 200,
    description: 'Categoria removida',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async delete(@Param('id') id: string) {
    await this.deleteCategory.execute(id);
    return { ok: true };
  }
}

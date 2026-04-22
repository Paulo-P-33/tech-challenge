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

import { CreateProductUseCase } from '../../../core/products/use-cases/create-product.usecase';
import { DeleteProductUseCase } from '../../../core/products/use-cases/delete-product.usecase';
import { GetProductUseCase } from '../../../core/products/use-cases/get-product.usecase';
import { ListProductsUseCase } from '../../../core/products/use-cases/list-products.usecase';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentProduct } from './products.presenter';

const createProductBodySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.object({
    currency: z.enum(['BRL', 'USD', 'EUR']),
    amount: z.number().int().min(0),
  }),
});

const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    categoryId: { type: 'string' },
    price: {
      type: 'object',
      properties: {
        currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'] },
        amount: { type: 'integer', description: 'Valor em centavos' },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Products')
@UseFilters(DomainExceptionFilter)
@Controller('/products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos',
    schema: { type: 'array', items: productSchema },
  })
  async list() {
    const products = await this.listProducts.execute();
    return products.map(presentProduct);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Dados do produto', schema: productSchema })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async get(@Param('id') id: string) {
    const product = await this.getProduct.execute(id);
    return presentProduct(product);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar produto (autenticado)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'categoryId', 'price'],
      properties: {
        name: { type: 'string', example: 'Notebook Pro' },
        categoryId: { type: 'string', example: 'uuid-da-categoria' },
        price: {
          type: 'object',
          required: ['currency', 'amount'],
          properties: {
            currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
            amount: { type: 'integer', minimum: 0, example: 299900, description: 'Valor em centavos' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Produto criado', schema: productSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async create(@Body() body: unknown) {
    const input = createProductBodySchema.parse(body);
    const product = await this.createProduct.execute(input);
    return presentProduct(product);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover produto (autenticado)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido', schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async delete(@Param('id') id: string) {
    await this.deleteProduct.execute(id);
    return { ok: true };
  }
}

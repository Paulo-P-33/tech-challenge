import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';
import { z } from 'zod';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { CreateProductUseCase } from '../../../core/products/use-cases/create-product.usecase';
import { DeleteProductUseCase } from '../../../core/products/use-cases/delete-product.usecase';
import { GetProductUseCase } from '../../../core/products/use-cases/get-product.usecase';
import { ListProductsUseCase } from '../../../core/products/use-cases/list-products.usecase';
import { presentProduct } from './products.presenter';

const createProductBodySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.object({
    currency: z.enum(['BRL', 'USD', 'EUR']),
    amount: z.number().int().min(0),
  }),
});

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
  async list() {
    const products = await this.listProducts.execute();
    return products.map(presentProduct);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const product = await this.getProduct.execute(id);
    return presentProduct(product);
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = createProductBodySchema.parse(body);
    const product = await this.createProduct.execute(input);
    return presentProduct(product);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteProduct.execute(id);
    return { ok: true };
  }
}


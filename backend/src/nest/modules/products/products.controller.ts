import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { UpdateProductImageUseCase } from '../../../core/products/use-cases/update-product-image.usecase';
import { Audit } from '../../shared/audit.decorator';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentProduct } from './products.presenter';

type UploadedFileType = { buffer: Buffer; mimetype: string } | undefined;

const createProductBodySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  priceCurrency: z.enum(['BRL', 'USD', 'EUR']),
  priceAmount: z.coerce.number().int().min(0),
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
    image: {
      type: 'string',
      nullable: true,
      description: 'Imagem do produto em base64 data URL (data:image/...;base64,...)',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Products')
@ApiBearerAuth()
@UseFilters(DomainExceptionFilter)
@UseGuards(JwtAuthGuard)
@Controller('/products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly updateProductImage: UpdateProductImageUseCase,
  ) {}

  @Get()
  @Audit('PRODUCT_LIST')
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
  @Audit('PRODUCT_VIEWED', 'product')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Dados do produto',
    schema: productSchema,
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async get(@Param('id') id: string) {
    const product = await this.getProduct.execute(id);
    return presentProduct(product);
  }

  @Post()
  @Audit('PRODUCT_CREATED', 'product')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Criar produto com imagem opcional (autenticado)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'categoryId', 'priceCurrency', 'priceAmount'],
      properties: {
        name: { type: 'string', example: 'Notebook Pro' },
        categoryId: { type: 'string', example: 'uuid-da-categoria' },
        priceCurrency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
        priceAmount: {
          type: 'integer',
          minimum: 0,
          example: 299900,
          description: 'Valor em centavos',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem do produto (opcional — JPEG, PNG, WebP, etc.)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Produto criado', schema: productSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async create(
    @Body() body: unknown,
    @UploadedFile() file: UploadedFileType,
  ) {
    const input = createProductBodySchema.parse(body);
    const product = await this.createProduct.execute({
      name: input.name,
      categoryId: input.categoryId,
      price: { currency: input.priceCurrency, amount: input.priceAmount },
      image: file?.buffer ?? null,
    });
    return presentProduct(product);
  }

  @Put(':id/image')
  @Audit('PRODUCT_IMAGE_UPDATED', 'product')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualizar imagem do produto (autenticado)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: 'Arquivo de imagem (JPEG, PNG, WebP, etc.)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagem atualizada', schema: productSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    const product = await this.updateProductImage.execute({
      productId: id,
      imageBuffer: file?.buffer ?? null,
    });
    return presentProduct(product);
  }

  @Delete(':id')
  @Audit('PRODUCT_DELETED', 'product')
  @ApiOperation({ summary: 'Remover produto (autenticado)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Produto removido',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async delete(@Param('id') id: string) {
    await this.deleteProduct.execute(id);
    return { ok: true };
  }
}

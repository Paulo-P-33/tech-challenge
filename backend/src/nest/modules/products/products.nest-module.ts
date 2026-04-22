import { Module } from '@nestjs/common';

import { CreateProductUseCase } from '../../../core/products/use-cases/create-product.usecase';
import { DeleteProductUseCase } from '../../../core/products/use-cases/delete-product.usecase';
import { GetProductUseCase } from '../../../core/products/use-cases/get-product.usecase';
import { ListProductsUseCase } from '../../../core/products/use-cases/list-products.usecase';
import { UpdateProductImageUseCase } from '../../../core/products/use-cases/update-product-image.usecase';
import { PrismaPersistenceModule } from '../../persistence/prisma-persistence.module';
import { CoreProvidersModule } from '../../shared/core-providers.module';
import { TOKENS } from '../../shared/tokens';

import { ProductsController } from './products.controller';

@Module({
  imports: [PrismaPersistenceModule, CoreProvidersModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: CreateProductUseCase,
      inject: [
        TOKENS.productsRepo,
        TOKENS.categoriesRepo,
        TOKENS.idGenerator,
        TOKENS.clock,
      ],
      useFactory: (productsRepo, categoriesRepo, id, clock) =>
        new CreateProductUseCase(productsRepo, categoriesRepo, id, clock),
    },
    {
      provide: ListProductsUseCase,
      inject: [TOKENS.productsRepo],
      useFactory: (repo) => new ListProductsUseCase(repo),
    },
    {
      provide: GetProductUseCase,
      inject: [TOKENS.productsRepo],
      useFactory: (repo) => new GetProductUseCase(repo),
    },
    {
      provide: DeleteProductUseCase,
      inject: [TOKENS.productsRepo],
      useFactory: (repo) => new DeleteProductUseCase(repo),
    },
    {
      provide: UpdateProductImageUseCase,
      inject: [TOKENS.productsRepo],
      useFactory: (repo) => new UpdateProductImageUseCase(repo),
    },
  ],
})
export class ProductsNestModule {}

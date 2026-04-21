import { Module } from '@nestjs/common';

import { CreateCategoryUseCase } from '../../../core/categories/use-cases/create-category.usecase';
import { DeleteCategoryUseCase } from '../../../core/categories/use-cases/delete-category.usecase';
import { GetCategoryUseCase } from '../../../core/categories/use-cases/get-category.usecase';
import { ListCategoriesUseCase } from '../../../core/categories/use-cases/list-categories.usecase';
import { PrismaPersistenceModule } from '../../persistence/prisma-persistence.module';
import { CoreProvidersModule } from '../../shared/core-providers.module';
import { TOKENS } from '../../shared/tokens';

import { CategoriesController } from './categories.controller';

@Module({
  imports: [PrismaPersistenceModule, CoreProvidersModule],
  controllers: [CategoriesController],
  providers: [
    {
      provide: CreateCategoryUseCase,
      inject: [TOKENS.categoriesRepo, TOKENS.idGenerator, TOKENS.clock],
      useFactory: (repo, id, clock) =>
        new CreateCategoryUseCase(repo, id, clock),
    },
    {
      provide: ListCategoriesUseCase,
      inject: [TOKENS.categoriesRepo],
      useFactory: (repo) => new ListCategoriesUseCase(repo),
    },
    {
      provide: GetCategoryUseCase,
      inject: [TOKENS.categoriesRepo],
      useFactory: (repo) => new GetCategoryUseCase(repo),
    },
    {
      provide: DeleteCategoryUseCase,
      inject: [TOKENS.categoriesRepo],
      useFactory: (repo) => new DeleteCategoryUseCase(repo),
    },
  ],
})
export class CategoriesNestModule {}

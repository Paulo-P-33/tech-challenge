import { Module } from '@nestjs/common';
import { TOKENS } from '../shared/tokens';
import { UsersMemoryRepository } from '../modules/users/users.memory-repository';
import { CategoriesMemoryRepository } from '../modules/categories/categories.memory-repository';
import { ProductsMemoryRepository } from '../modules/products/products.memory-repository';

@Module({
  providers: [
    { provide: TOKENS.usersRepo, useClass: UsersMemoryRepository },
    { provide: TOKENS.categoriesRepo, useClass: CategoriesMemoryRepository },
    { provide: TOKENS.productsRepo, useClass: ProductsMemoryRepository },
  ],
  exports: [TOKENS.usersRepo, TOKENS.categoriesRepo, TOKENS.productsRepo],
})
export class PersistenceModule {}


import { Module } from '@nestjs/common';

import { AuthCredentialsMemoryRepository } from '../modules/auth/auth.credentials.memory-repository';
import { CategoriesMemoryRepository } from '../modules/categories/categories.memory-repository';
import { FavoritesMemoryRepository } from '../modules/favorites/favorites.memory-repository';
import { ProductsMemoryRepository } from '../modules/products/products.memory-repository';
import { UsersMemoryRepository } from '../modules/users/users.memory-repository';
import { TOKENS } from '../shared/tokens';

@Module({
  providers: [
    { provide: TOKENS.usersRepo, useClass: UsersMemoryRepository },
    { provide: TOKENS.categoriesRepo, useClass: CategoriesMemoryRepository },
    { provide: TOKENS.productsRepo, useClass: ProductsMemoryRepository },
    { provide: TOKENS.favoritesRepo, useClass: FavoritesMemoryRepository },
    {
      provide: TOKENS.authCredentialsRepo,
      useClass: AuthCredentialsMemoryRepository,
    },
  ],
  exports: [
    TOKENS.usersRepo,
    TOKENS.categoriesRepo,
    TOKENS.productsRepo,
    TOKENS.favoritesRepo,
    TOKENS.authCredentialsRepo,
  ],
})
export class PersistenceModule {}

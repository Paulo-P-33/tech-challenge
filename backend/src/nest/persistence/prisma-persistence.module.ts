import { Module } from '@nestjs/common';

import { AuthCredentialsPrismaRepository } from '../modules/auth/auth.credentials.prisma-repository';
import { TOKENS } from '../shared/tokens';

import { CategoriesPrismaRepository } from './prisma/categories.prisma-repository';
import { FavoritesPrismaRepository } from './prisma/favorites.prisma-repository';
import { PrismaService } from './prisma/prisma.service';
import { ProductsPrismaRepository } from './prisma/products.prisma-repository';
import { UsersPrismaRepository } from './prisma/users.prisma-repository';

@Module({
  providers: [
    PrismaService,
    { provide: TOKENS.usersRepo, useClass: UsersPrismaRepository },
    { provide: TOKENS.categoriesRepo, useClass: CategoriesPrismaRepository },
    { provide: TOKENS.productsRepo, useClass: ProductsPrismaRepository },
    { provide: TOKENS.favoritesRepo, useClass: FavoritesPrismaRepository },
    {
      provide: TOKENS.authCredentialsRepo,
      useClass: AuthCredentialsPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    TOKENS.usersRepo,
    TOKENS.categoriesRepo,
    TOKENS.productsRepo,
    TOKENS.favoritesRepo,
    TOKENS.authCredentialsRepo,
  ],
})
export class PrismaPersistenceModule {}

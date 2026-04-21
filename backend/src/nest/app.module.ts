import { Module } from '@nestjs/common';

import { AuthNestModule } from './modules/auth/auth.nest-module';
import { CategoriesNestModule } from './modules/categories/categories.nest-module';
import { FavoritesNestModule } from './modules/favorites/favorites.nest-module';
import { ProductsNestModule } from './modules/products/products.nest-module';
import { UsersNestModule } from './modules/users/users.nest-module';

@Module({
  imports: [
    AuthNestModule,
    UsersNestModule,
    CategoriesNestModule,
    ProductsNestModule,
    FavoritesNestModule,
  ],
})
export class AppModule {}

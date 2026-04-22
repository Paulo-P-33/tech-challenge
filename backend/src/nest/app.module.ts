import { Module } from '@nestjs/common';

import { AuditLogsNestModule } from './modules/audit-logs/audit-logs.nest-module';
import { AuthNestModule } from './modules/auth/auth.nest-module';
import { CategoriesNestModule } from './modules/categories/categories.nest-module';
import { FavoritesNestModule } from './modules/favorites/favorites.nest-module';
import { ProductsNestModule } from './modules/products/products.nest-module';
import { UsersNestModule } from './modules/users/users.nest-module';

@Module({
  imports: [
    AuditLogsNestModule,
    AuthNestModule,
    UsersNestModule,
    CategoriesNestModule,
    ProductsNestModule,
    FavoritesNestModule,
  ],
})
export class AppModule {}

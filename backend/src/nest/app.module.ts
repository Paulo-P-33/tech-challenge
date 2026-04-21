import { Module } from '@nestjs/common';
import { UsersNestModule } from './modules/users/users.nest-module';
import { CategoriesNestModule } from './modules/categories/categories.nest-module';
import { ProductsNestModule } from './modules/products/products.nest-module';
import { AuthNestModule } from './modules/auth/auth.nest-module';

@Module({
  imports: [AuthNestModule, UsersNestModule, CategoriesNestModule, ProductsNestModule],
})
export class AppModule {}


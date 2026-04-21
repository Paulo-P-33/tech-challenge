import { Module } from '@nestjs/common';

import { FavoriteProductUseCase } from '../../../core/favorites/use-cases/favorite-product.usecase';
import { ListFavoritesUseCase } from '../../../core/favorites/use-cases/list-favorites.usecase';
import { UnfavoriteProductUseCase } from '../../../core/favorites/use-cases/unfavorite-product.usecase';
import { PersistenceModule } from '../../persistence/persistence.module';
import { TOKENS } from '../../shared/tokens';

import { FavoritesController } from './favorites.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [FavoritesController],
  providers: [
    {
      provide: FavoriteProductUseCase,
      inject: [TOKENS.favoritesRepo, TOKENS.productsRepo],
      useFactory: (favoritesRepo, productsRepo) =>
        new FavoriteProductUseCase(favoritesRepo, productsRepo),
    },
    {
      provide: UnfavoriteProductUseCase,
      inject: [TOKENS.favoritesRepo],
      useFactory: (favoritesRepo) =>
        new UnfavoriteProductUseCase(favoritesRepo),
    },
    {
      provide: ListFavoritesUseCase,
      inject: [TOKENS.favoritesRepo],
      useFactory: (favoritesRepo) => new ListFavoritesUseCase(favoritesRepo),
    },
  ],
})
export class FavoritesNestModule {}

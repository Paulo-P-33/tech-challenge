import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { FavoriteProductUseCase } from '../../../core/favorites/use-cases/favorite-product.usecase';
import { ListFavoritesUseCase } from '../../../core/favorites/use-cases/list-favorites.usecase';
import { UnfavoriteProductUseCase } from '../../../core/favorites/use-cases/unfavorite-product.usecase';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentFavorite } from './favorites.presenter';

type AuthedReq = { user: { id: string } };

@UseFilters(DomainExceptionFilter)
@UseGuards(JwtAuthGuard)
@Controller()
export class FavoritesController {
  constructor(
    private readonly favoriteProduct: FavoriteProductUseCase,
    private readonly unfavoriteProduct: UnfavoriteProductUseCase,
    private readonly listFavorites: ListFavoritesUseCase,
  ) {}

  @Post('/products/:id/favorite')
  async favoriteProd(@Req() req: AuthedReq, @Param('id') id: string) {
    await this.favoriteProduct.execute(req.user.id, id);
    return { ok: true };
  }

  @Delete('/products/:id/favorite')
  async unfavoriteProd(@Req() req: AuthedReq, @Param('id') id: string) {
    await this.unfavoriteProduct.execute(req.user.id, id);
    return { ok: true };
  }

  @Get('/me/favorites')
  async myFavorites(@Req() req: AuthedReq) {
    const favorites = await this.listFavorites.execute(req.user.id);
    return favorites.map(presentFavorite);
  }
}

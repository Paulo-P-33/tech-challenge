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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FavoriteProductUseCase } from '../../../core/favorites/use-cases/favorite-product.usecase';
import { ListFavoritesUseCase } from '../../../core/favorites/use-cases/list-favorites.usecase';
import { UnfavoriteProductUseCase } from '../../../core/favorites/use-cases/unfavorite-product.usecase';
import { Audit } from '../../shared/audit.decorator';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentFavorite } from './favorites.presenter';

type AuthedReq = { user: { id: string } };

const favoriteSchema = {
  type: 'object',
  properties: {
    targetType: { type: 'string' },
    targetId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Favorites')
@ApiBearerAuth()
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
  @Audit('PRODUCT_FAVORITED', 'product')
  @ApiOperation({ summary: 'Adicionar produto aos favoritos' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiResponse({
    status: 201,
    description: 'Produto favoritado',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async favoriteProd(@Req() req: AuthedReq, @Param('id') id: string) {
    await this.favoriteProduct.execute(req.user.id, id);
    return { ok: true };
  }

  @Delete('/products/:id/favorite')
  @Audit('PRODUCT_UNFAVORITED', 'product')
  @ApiOperation({ summary: 'Remover produto dos favoritos' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Produto removido dos favoritos',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  async unfavoriteProd(@Req() req: AuthedReq, @Param('id') id: string) {
    await this.unfavoriteProduct.execute(req.user.id, id);
    return { ok: true };
  }

  @Get('/me/favorites')
  @Audit('FAVORITES_LIST')
  @ApiOperation({ summary: 'Listar favoritos do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos',
    schema: { type: 'array', items: favoriteSchema },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async myFavorites(@Req() req: AuthedReq) {
    const favorites = await this.listFavorites.execute(req.user.id);
    return favorites.map(presentFavorite);
  }
}

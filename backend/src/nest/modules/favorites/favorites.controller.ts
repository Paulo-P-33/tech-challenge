import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de favoritos',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: favoriteSchema },
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async myFavorites(@Req() req: AuthedReq, @Query() query: unknown) {
    const { page, limit } = paginationQuerySchema.parse(query);
    const result = await this.listFavorites.execute(req.user.id, {
      page,
      limit,
    });
    return { ...result, data: result.data.map(presentFavorite) };
  }
}

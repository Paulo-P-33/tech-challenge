import type { Paginated, PaginationParams } from '../shared/pagination';

import type { Favorite, FavoriteTargetType } from './favorite.entity';

export interface FavoritesRepository {
  listByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<Paginated<Favorite>>;
  exists(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<boolean>;
  add(favorite: Favorite): Promise<void>;
  remove(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<void>;
}

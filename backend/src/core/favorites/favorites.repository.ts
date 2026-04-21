import type { Favorite, FavoriteTargetType } from './favorite.entity';

export interface FavoritesRepository {
  listByUser(userId: string): Promise<Favorite[]>;
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

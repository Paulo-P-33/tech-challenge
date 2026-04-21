import type { Favorite } from '../../../core/favorites/favorite.entity';

export function presentFavorite(favorite: Favorite) {
  return {
    targetType: favorite.targetType,
    targetId: favorite.targetId,
    createdAt: favorite.createdAt.toISOString(),
  };
}

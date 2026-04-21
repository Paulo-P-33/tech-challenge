import type {
  Favorite,
  FavoriteTargetType,
} from '../../../core/favorites/favorite.entity';
import type { FavoritesRepository } from '../../../core/favorites/favorites.repository';

function key(userId: string, type: FavoriteTargetType, targetId: string) {
  return `${userId}:${type}:${targetId}`;
}

export class FavoritesMemoryRepository implements FavoritesRepository {
  private readonly items = new Map<string, Favorite>();

  async listByUser(userId: string): Promise<Favorite[]> {
    return Array.from(this.items.values()).filter(
      (fav) => fav.userId === userId,
    );
  }

  async exists(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<boolean> {
    return this.items.has(key(userId, targetType, targetId));
  }

  async add(favorite: Favorite): Promise<void> {
    this.items.set(
      key(favorite.userId, favorite.targetType, favorite.targetId),
      favorite,
    );
  }

  async remove(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<void> {
    this.items.delete(key(userId, targetType, targetId));
  }
}

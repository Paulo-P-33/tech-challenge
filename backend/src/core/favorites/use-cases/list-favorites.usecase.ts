import type { Paginated, PaginationParams } from '../../shared/pagination';
import type { Favorite } from '../favorite.entity';
import type { FavoritesRepository } from '../favorites.repository';

export class ListFavoritesUseCase {
  constructor(private readonly favoritesRepo: FavoritesRepository) {}

  async execute(
    userId: string,
    pagination: PaginationParams,
  ): Promise<Paginated<Favorite>> {
    return this.favoritesRepo.listByUser(userId, pagination);
  }
}

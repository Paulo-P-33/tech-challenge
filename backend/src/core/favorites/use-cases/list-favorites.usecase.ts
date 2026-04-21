import type { FavoritesRepository } from '../favorites.repository';

export class ListFavoritesUseCase {
  constructor(private readonly favoritesRepo: FavoritesRepository) {}

  async execute(userId: string) {
    return await this.favoritesRepo.listByUser(userId);
  }
}

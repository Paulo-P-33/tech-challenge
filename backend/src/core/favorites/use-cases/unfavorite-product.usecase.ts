import type { FavoritesRepository } from '../favorites.repository';

export class UnfavoriteProductUseCase {
  constructor(private readonly favoritesRepo: FavoritesRepository) {}

  async execute(userId: string, productId: string): Promise<void> {
    await this.favoritesRepo.remove(userId, 'product', productId);
  }
}

import type { ProductsRepository } from '../../products/products.repository';
import { NotFoundError } from '../../shared/errors';
import { Favorite } from '../favorite.entity';
import type { FavoritesRepository } from '../favorites.repository';

export class FavoriteProductUseCase {
  constructor(
    private readonly favoritesRepo: FavoritesRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async execute(userId: string, productId: string): Promise<void> {
    const product = await this.productsRepo.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const exists = await this.favoritesRepo.exists(
      userId,
      'product',
      productId,
    );
    if (exists) return;

    await this.favoritesRepo.add(
      Favorite.create({ userId, targetType: 'product', targetId: productId }),
    );
  }
}

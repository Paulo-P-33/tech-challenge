import { NotFoundError } from '../../shared/errors';
import type { Product } from '../product.entity';
import type { ProductsRepository } from '../products.repository';

export interface UpdateProductImageInput {
  productId: string;
  imageBuffer: Buffer | null;
}

export class UpdateProductImageUseCase {
  constructor(private readonly repo: ProductsRepository) {}

  async execute(input: UpdateProductImageInput): Promise<Product> {
    const product = await this.repo.findById(input.productId);
    if (!product) throw new NotFoundError('Product not found');
    product.updateImage(input.imageBuffer);
    await this.repo.save(product);
    return product;
  }
}

import { Injectable } from '@nestjs/common';

import { Product, ProductId } from '../../../core/products/product.entity';
import type { Money } from '../../../core/products/product.entity';
import { ProductsRepository } from '../../../core/products/products.repository';
import type {
  Paginated,
  PaginationParams,
} from '../../../core/shared/pagination';

import { PrismaService } from './prisma.service';

function toBuffer(bytes: Uint8Array | null | undefined): Buffer | null {
  if (!bytes) return null;
  return Buffer.from(bytes);
}

@Injectable()
export class ProductsPrismaRepository implements ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ProductId): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    if (!row) return null;
    return Product.create({
      ...row,
      price: {
        currency: row.priceCurrency as Money['currency'],
        amount: row.priceAmount,
      },
      image: toBuffer(row.image),
    });
  }

  async list({ page, limit }: PaginationParams): Promise<Paginated<Product>> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({ skip, take: limit }),
      this.prisma.product.count(),
    ]);
    return {
      data: rows.map((row) =>
        Product.create({
          ...row,
          price: {
            currency: row.priceCurrency as Money['currency'],
            amount: row.priceAmount,
          },
          image: toBuffer(row.image),
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        priceAmount: product.price.amount,
        priceCurrency: product.price.currency,

        image: (product.image ?? undefined) as any,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  }

  async save(product: Product): Promise<void> {
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        categoryId: product.categoryId,
        priceAmount: product.price.amount,
        priceCurrency: product.price.currency,

        image: product.image as any,
        updatedAt: product.updatedAt,
      },
    });
  }

  async delete(id: ProductId): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}

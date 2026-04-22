import { Injectable } from '@nestjs/common';

import { Product, ProductId } from '../../../core/products/product.entity';
import type { Money } from '../../../core/products/product.entity';
import { ProductsRepository } from '../../../core/products/products.repository';

import { PrismaService } from './prisma.service';

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
    });
  }

  async list(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows.map((row) =>
      Product.create({
        ...row,
        price: {
          currency: row.priceCurrency as Money['currency'],
          amount: row.priceAmount,
        },
      }),
    );
  }

  async create(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        priceAmount: product.price.amount,
        priceCurrency: product.price.currency,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  }

  async delete(id: ProductId): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}

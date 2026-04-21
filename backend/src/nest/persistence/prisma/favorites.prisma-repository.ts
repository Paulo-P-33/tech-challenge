import { Injectable } from '@nestjs/common';

import {
  Favorite,
  FavoriteTargetType,
} from '../../../core/favorites/favorite.entity';
import { FavoritesRepository } from '../../../core/favorites/favorites.repository';

import { PrismaService } from './prisma.service';

@Injectable()
export class FavoritesPrismaRepository implements FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string): Promise<Favorite[]> {
    const rows = await this.prisma.favorite.findMany({ where: { userId } });
    return rows.map((row) =>
      Favorite.create({
        userId: row.userId,
        targetType: row.targetType as FavoriteTargetType,
        targetId: row.targetId,
        createdAt: row.createdAt,
      }),
    );
  }

  async exists(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<boolean> {
    const row = await this.prisma.favorite.findUnique({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
    });
    return row !== null;
  }

  async add(favorite: Favorite): Promise<void> {
    await this.prisma.favorite.create({
      data: {
        userId: favorite.userId,
        targetType: favorite.targetType,
        targetId: favorite.targetId,
        createdAt: favorite.createdAt,
      },
    });
  }

  async remove(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<void> {
    await this.prisma.favorite.delete({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
    });
  }
}

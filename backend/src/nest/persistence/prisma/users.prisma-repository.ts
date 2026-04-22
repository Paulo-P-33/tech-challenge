import { Injectable } from '@nestjs/common';

import type {
  Paginated,
  PaginationParams,
} from '../../../core/shared/pagination';
import { User, UserId, UserRole } from '../../../core/users/user.entity';
import { UsersRepository } from '../../../core/users/users.repository';

import { PrismaService } from './prisma.service';

function toBuffer(bytes: Uint8Array | null | undefined): Buffer | null {
  if (!bytes) return null;
  return Buffer.from(bytes);
}

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return User.create({
      ...row,
      role: row.role as UserRole,
      avatar: toBuffer(row.avatar),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!row) return null;
    return User.create({
      ...row,
      role: row.role as UserRole,
      avatar: toBuffer(row.avatar),
    });
  }

  async list({ page, limit }: PaginationParams): Promise<Paginated<User>> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit }),
      this.prisma.user.count(),
    ]);
    return {
      data: rows.map((row) =>
        User.create({
          ...row,
          role: row.role as UserRole,
          avatar: toBuffer(row.avatar),
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

        avatar: (user.avatar ?? undefined) as any,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        role: user.role,

        avatar: user.avatar as any,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

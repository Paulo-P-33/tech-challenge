import { Injectable } from '@nestjs/common';

import { User, UserId, UserRole } from '../../../core/users/user.entity';
import { UsersRepository } from '../../../core/users/users.repository';

import { PrismaService } from './prisma.service';

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return User.create({ ...row, role: row.role as UserRole });
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!row) return null;
    return User.create({ ...row, role: row.role as UserRole });
  }

  async list(): Promise<User[]> {
    const rows = await this.prisma.user.findMany();
    return rows.map((row) =>
      User.create({ ...row, role: row.role as UserRole }),
    );
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

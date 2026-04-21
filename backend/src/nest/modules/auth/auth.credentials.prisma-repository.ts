import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../persistence/prisma/prisma.service';

import { AuthCredentialsRepository } from './auth.credentials.repository';

@Injectable()
export class AuthCredentialsPrismaRepository implements AuthCredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.authCredential.upsert({
      where: { userId },
      create: { userId, passwordHash },
      update: { passwordHash },
    });
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    const row = await this.prisma.authCredential.findUnique({
      where: { userId },
    });
    return row?.passwordHash ?? null;
  }
}

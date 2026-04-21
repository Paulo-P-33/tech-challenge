import type { AuthCredentialsRepository } from './auth.credentials.repository';

export class AuthCredentialsMemoryRepository implements AuthCredentialsRepository {
  private readonly hashesByUserId = new Map<string, string>();

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    this.hashesByUserId.set(userId, passwordHash);
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    return this.hashesByUserId.get(userId) ?? null;
  }
}


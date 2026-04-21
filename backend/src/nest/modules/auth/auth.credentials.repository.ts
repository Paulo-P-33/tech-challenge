export interface AuthCredentialsRepository {
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;
  getPasswordHash(userId: string): Promise<string | null>;
}


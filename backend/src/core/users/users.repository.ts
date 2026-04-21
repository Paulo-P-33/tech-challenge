import type { User, UserId } from './user.entity';

export interface UsersRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(): Promise<User[]>;
  create(user: User): Promise<void>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

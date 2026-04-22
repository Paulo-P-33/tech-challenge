import type {
  Paginated,
  PaginationParams,
} from '../../../core/shared/pagination';
import type { User, UserId } from '../../../core/users/user.entity';
import type { UsersRepository } from '../../../core/users/users.repository';

export class UsersMemoryRepository implements UsersRepository {
  private readonly items = new Map<UserId, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.items.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.items.values()) {
      if (user.email === normalized) return user;
    }
    return null;
  }

  async list({ page, limit }: PaginationParams): Promise<Paginated<User>> {
    const all = Array.from(this.items.values());
    const skip = (page - 1) * limit;
    return {
      data: all.slice(skip, skip + limit),
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit),
    };
  }

  async create(user: User): Promise<void> {
    this.items.set(user.id, user);
  }

  async save(user: User): Promise<void> {
    this.items.set(user.id, user);
  }

  async delete(id: UserId): Promise<void> {
    this.items.delete(id);
  }
}

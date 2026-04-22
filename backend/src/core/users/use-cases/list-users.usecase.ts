import type { Paginated, PaginationParams } from '../../shared/pagination';
import type { User } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export class ListUsersUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(pagination: PaginationParams): Promise<Paginated<User>> {
    return this.repo.list(pagination);
  }
}

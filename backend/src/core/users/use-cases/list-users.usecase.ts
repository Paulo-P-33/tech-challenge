import type { UsersRepository } from '../users.repository';
import type { User } from '../user.entity';

export class ListUsersUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(): Promise<User[]> {
    return this.repo.list();
  }
}


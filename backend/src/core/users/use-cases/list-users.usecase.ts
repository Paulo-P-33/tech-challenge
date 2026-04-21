import type { User } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export class ListUsersUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(): Promise<User[]> {
    return this.repo.list();
  }
}

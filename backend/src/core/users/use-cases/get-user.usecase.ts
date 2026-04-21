import { NotFoundError } from '../../shared/errors';
import type { User, UserId } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export class GetUserUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(id: UserId): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}

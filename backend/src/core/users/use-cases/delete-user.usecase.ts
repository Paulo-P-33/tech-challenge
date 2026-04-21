import { NotFoundError } from '../../shared/errors';
import type { UserId } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export class DeleteUserUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(id: UserId): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('User not found');
    await this.repo.delete(id);
  }
}

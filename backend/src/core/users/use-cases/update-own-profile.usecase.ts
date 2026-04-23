import { ConflictError, NotFoundError } from '../../shared/errors';
import type { User } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export interface UpdateOwnProfileInput {
  userId: string;
  name?: string;
  email?: string;
}

export class UpdateOwnProfileUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: UpdateOwnProfileInput): Promise<User> {
    const user = await this.repo.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');

    if (input.name) user.rename(input.name);

    if (input.email && input.email.trim().toLowerCase() !== user.email) {
      const existing = await this.repo.findByEmail(input.email);
      if (existing) throw new ConflictError('Email already in use');
      user.updateEmail(input.email);
    }

    await this.repo.save(user);
    return user;
  }
}

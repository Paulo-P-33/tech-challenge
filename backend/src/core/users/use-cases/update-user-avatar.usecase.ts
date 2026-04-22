import { NotFoundError } from '../../shared/errors';
import type { User } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export interface UpdateUserAvatarInput {
  userId: string;
  imageBuffer: Buffer | null;
}

export class UpdateUserAvatarUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: UpdateUserAvatarInput): Promise<User> {
    const user = await this.repo.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    user.updateAvatar(input.imageBuffer);
    await this.repo.save(user);
    return user;
  }
}

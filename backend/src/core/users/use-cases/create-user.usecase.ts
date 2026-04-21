import type { Clock } from '../../shared/clock';
import { ConflictError } from '../../shared/errors';
import type { IdGenerator } from '../../shared/id';
import { User } from '../user.entity';
import type { UsersRepository } from '../users.repository';

export interface CreateUserInput {
  name: string;
  email: string;
  role?: 'user' | 'admin';
}

export class CreateUserUseCase {
  constructor(
    private readonly repo: UsersRepository,
    private readonly id: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing)
      throw new ConflictError('User with this email already exists');

    const now = this.clock();
    const user = User.create({
      id: this.id(),
      name: input.name,
      email: input.email,
      role: input.role ?? 'user',
      createdAt: now,
      updatedAt: now,
    });

    await this.repo.create(user);
    return user;
  }
}

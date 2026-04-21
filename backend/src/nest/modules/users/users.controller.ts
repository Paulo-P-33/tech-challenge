import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../../core/users/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../../core/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../../core/users/use-cases/list-users.usecase';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { TOKENS } from '../../shared/tokens';
import type { AuthCredentialsRepository } from '../auth/auth.credentials.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentUser } from './users.presenter';

const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3),
  password: z.string().min(6),
});

@UseFilters(DomainExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('/users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    @Inject(TOKENS.authCredentialsRepo)
    private readonly credentialsRepo: AuthCredentialsRepository,
  ) {}

  @Get()
  async list() {
    const users = await this.listUsers.execute();
    return users.map(presentUser);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const user = await this.getUser.execute(id);
    return presentUser(user);
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = createUserBodySchema.parse(body);
    const user = await this.createUser.execute({
      name: input.name,
      email: input.email,
      role: 'user',
    });
    const passwordHash = await bcrypt.hash(input.password, 10);
    await this.credentialsRepo.setPasswordHash(user.id, passwordHash);
    return presentUser(user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUser.execute(id);
    return { ok: true };
  }
}

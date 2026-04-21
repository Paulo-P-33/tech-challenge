import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';
import { z } from 'zod';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { GetUserUseCase } from '../../../core/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../../core/users/use-cases/list-users.usecase';
import { DeleteUserUseCase } from '../../../core/users/use-cases/delete-user.usecase';
import { presentUser } from './users.presenter';

const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3),
});

@UseFilters(DomainExceptionFilter)
@Controller('/users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
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
    const user = await this.createUser.execute(input);
    return presentUser(user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUser.execute(id);
    return { ok: true };
  }
}


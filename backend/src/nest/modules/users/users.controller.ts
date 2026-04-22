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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../../core/users/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../../core/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../../core/users/use-cases/list-users.usecase';
import { Audit } from '../../shared/audit.decorator';
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

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Users')
@ApiBearerAuth()
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
  @Audit('USER_LIST')
  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    schema: { type: 'array', items: userSchema },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  async list() {
    const users = await this.listUsers.execute();
    return users.map(presentUser);
  }

  @Get(':id')
  @Audit('USER_VIEWED', 'user')
  @ApiOperation({ summary: 'Buscar usuário por ID (apenas admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    schema: userSchema,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async get(@Param('id') id: string) {
    const user = await this.getUser.execute(id);
    return presentUser(user);
  }

  @Post()
  @Audit('USER_CREATED', 'user')
  @ApiOperation({ summary: 'Criar usuário (apenas admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@example.com' },
        password: { type: 'string', minLength: 6, example: 'senha123' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado',
    schema: userSchema,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
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
  @Audit('USER_DELETED', 'user')
  @ApiOperation({ summary: 'Remover usuário (apenas admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async delete(@Param('id') id: string) {
    await this.deleteUser.execute(id);
    return { ok: true };
  }
}

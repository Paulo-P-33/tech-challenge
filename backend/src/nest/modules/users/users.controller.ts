import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../../core/users/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../../core/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../../core/users/use-cases/list-users.usecase';
import { UpdateUserAvatarUseCase } from '../../../core/users/use-cases/update-user-avatar.usecase';
import { Audit } from '../../shared/audit.decorator';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { TOKENS } from '../../shared/tokens';
import type { AuthCredentialsRepository } from '../auth/auth.credentials.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentUser } from './users.presenter';

type UploadedFileType = { buffer: Buffer; mimetype: string } | undefined;

const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'] },
    avatar: {
      type: 'string',
      nullable: true,
      description:
        'Imagem de perfil em base64 data URL (data:image/...;base64,...)',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Users')
@ApiBearerAuth()
@UseFilters(DomainExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly updateUserAvatar: UpdateUserAvatarUseCase,
    @Inject(TOKENS.authCredentialsRepo)
    private readonly credentialsRepo: AuthCredentialsRepository,
  ) {}

  @Get()
  @Roles('admin')
  @Audit('USER_LIST')
  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuários',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: userSchema },
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  async list(@Query() query: unknown) {
    const { page, limit } = paginationQuerySchema.parse(query);
    const result = await this.listUsers.execute({ page, limit });
    return { ...result, data: result.data.map(presentUser) };
  }

  @Get(':id')
  @Roles('admin')
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
  @ApiOperation({
    summary: 'Criar usuário (autenticado; role=admin só aceito por admins)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@example.com' },
        password: { type: 'string', minLength: 6, example: 'senha123' },
        role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado',
    schema: userSchema,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async create(
    @Body() body: unknown,
    @Req() req: { user?: { role?: string } },
  ) {
    const input = createUserBodySchema.parse(body);
    const role = req.user?.role === 'admin' ? input.role : 'user';
    const user = await this.createUser.execute({
      name: input.name,
      email: input.email,
      role,
    });
    const passwordHash = await bcrypt.hash(input.password, 10);
    await this.credentialsRepo.setPasswordHash(user.id, passwordHash);
    return presentUser(user);
  }

  @Put(':id/avatar')
  @Roles('admin')
  @Audit('USER_AVATAR_UPDATED', 'user')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Atualizar imagem de perfil do usuário (apenas admin)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPEG, PNG, WebP, etc.)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar atualizado',
    schema: userSchema,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    const user = await this.updateUserAvatar.execute({
      userId: id,
      imageBuffer: file?.buffer ?? null,
    });
    return presentUser(user);
  }

  @Delete(':id')
  @Roles('admin')
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

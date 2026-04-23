import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { UpdateOwnProfileUseCase } from '../../../core/users/use-cases/update-own-profile.usecase';
import { UpdateUserAvatarUseCase } from '../../../core/users/use-cases/update-user-avatar.usecase';
import { Audit } from '../../shared/audit.decorator';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { TOKENS } from '../../shared/tokens';
import { presentUser } from '../users/users.presenter';

import type { AuthCredentialsRepository } from './auth.credentials.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

type UploadedFileType = { buffer: Buffer; mimetype: string } | undefined;

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().min(3).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(6).optional(),
});

@ApiTags('Auth')
@UseFilters(DomainExceptionFilter)
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly updateOwnProfile: UpdateOwnProfileUseCase,
    private readonly updateAvatar: UpdateUserAvatarUseCase,
    @Inject(TOKENS.authCredentialsRepo)
    private readonly credentialsRepo: AuthCredentialsRepository,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('/register')
  @Audit('USER_REGISTERED', 'user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar novo usuário (apenas admin)' })
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
    description: 'Usuário registrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  async register(@Body() body: unknown) {
    const input = registerSchema.parse(body);
    const { user, accessToken } = await this.auth.register(input);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  @Post('/login')
  @Audit('USER_LOGIN')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'joao@example.com' },
        password: { type: 'string', minLength: 6, example: 'senha123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: unknown) {
    const input = loginSchema.parse(body);
    const { user, accessToken } = await this.auth.login(input);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @Audit('AUTH_ME_VIEWED')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o usuário autenticado atual' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário autenticado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['user', 'admin'] },
        avatar: {
          type: 'string',
          nullable: true,
          description: 'Imagem de perfil em base64 data URL',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async me(@Req() req: { user: Parameters<typeof presentUser>[0] }) {
    return presentUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  @Audit('PROFILE_UPDATED')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza nome, e-mail ou senha do usuário logado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'novo@email.com' },
        currentPassword: { type: 'string', example: 'senhaAtual' },
        newPassword: { type: 'string', minLength: 6, example: 'novaSenha123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 401,
    description: 'Senha atual incorreta ou não autenticado',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async updateMe(@Body() body: unknown, @Req() req: { user: { id: string } }) {
    const input = updateProfileSchema.parse(body);

    if (input.newPassword) {
      if (!input.currentPassword)
        throw new UnauthorizedException('Current password is required');
      const hash = await this.credentialsRepo.getPasswordHash(req.user.id);
      const ok = hash && (await bcrypt.compare(input.currentPassword, hash));
      if (!ok) throw new UnauthorizedException('Current password is incorrect');
      const newHash = await bcrypt.hash(input.newPassword, 10);
      await this.credentialsRepo.setPasswordHash(req.user.id, newHash);
    }

    const user = await this.updateOwnProfile.execute({
      userId: req.user.id,
      name: input.name,
      email: input.email,
    });

    return presentUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/me/avatar')
  @Audit('PROFILE_AVATAR_UPDATED')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza foto de perfil do usuário logado' })
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
  @ApiResponse({ status: 200, description: 'Avatar atualizado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async updateMyAvatar(
    @Req() req: { user: { id: string } },
    @UploadedFile() file: UploadedFileType,
  ) {
    const user = await this.updateAvatar.execute({
      userId: req.user.id,
      imageBuffer: file?.buffer ?? null,
    });
    return presentUser(user);
  }
}

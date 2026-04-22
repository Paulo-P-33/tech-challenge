import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';

import { Audit } from '../../shared/audit.decorator';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

@ApiTags('Auth')
@UseFilters(DomainExceptionFilter)
@Controller('/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

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
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async me(
    @Req()
    req: {
      user: { id: string; name: string; email: string; role: 'user' | 'admin' };
    },
  ) {
    return {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
  }
}

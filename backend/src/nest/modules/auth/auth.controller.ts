import { Body, Controller, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

@UseFilters(DomainExceptionFilter)
@Controller('/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('/register')
  async register(@Body() body: unknown) {
    const input = registerSchema.parse(body);
    const { user, accessToken } = await this.auth.register(input);
    return { user: { id: user.id, name: user.name, email: user.email }, accessToken };
  }

  @Post('/login')
  async login(@Body() body: unknown) {
    const input = loginSchema.parse(body);
    const { user, accessToken } = await this.auth.login(input);
    return { user: { id: user.id, name: user.name, email: user.email }, accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@Req() req: { user: { id: string; name: string; email: string } }) {
    return req.user;
  }
}


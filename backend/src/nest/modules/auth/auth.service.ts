import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import type { UsersRepository } from '../../../core/users/users.repository';
import { TOKENS } from '../../shared/tokens';
import type { AuthCredentialsRepository } from './auth.credentials.repository';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly createUser: CreateUserUseCase,
    @Inject(TOKENS.usersRepo) private readonly usersRepo: UsersRepository,
    @Inject(TOKENS.authCredentialsRepo) private readonly credentialsRepo: AuthCredentialsRepository,
  ) {}

  async register(input: RegisterInput) {
    const user = await this.createUser.execute({ name: input.name, email: input.email });
    const passwordHash = await bcrypt.hash(input.password, 10);
    await this.credentialsRepo.setPasswordHash(user.id, passwordHash);
    return { user, accessToken: await this.signAccessToken(user.id) };
  }

  async login(input: LoginInput) {
    const user = await this.usersRepo.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const hash = await this.credentialsRepo.getPasswordHash(user.id);
    if (!hash) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(input.password, hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return { user, accessToken: await this.signAccessToken(user.id) };
  }

  async validateUserFromJwtPayload(payload: { sub: string }) {
    const user = await this.usersRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Invalid token');
    return user;
  }

  private async signAccessToken(userId: string) {
    return await this.jwt.signAsync({ sub: userId });
  }
}


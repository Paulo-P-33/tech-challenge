import {
  Inject,
  Injectable,
  type OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
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
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwt: JwtService,
    private readonly createUser: CreateUserUseCase,
    @Inject(TOKENS.usersRepo) private readonly usersRepo: UsersRepository,
    @Inject(TOKENS.authCredentialsRepo)
    private readonly credentialsRepo: AuthCredentialsRepository,
  ) {}

  async onModuleInit() {
    await this.ensureSeedAdmin();
  }

  async register(input: RegisterInput) {
    const user = await this.createUser.execute({
      name: input.name,
      email: input.email,
      role: 'user',
    });
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

  private async ensureSeedAdmin() {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    const name = process.env.ADMIN_NAME?.trim() ?? 'Admin';
    if (!email || !password) return;

    const existing = await this.usersRepo.findByEmail(email);
    if (existing) return;

    const admin = await this.createUser.execute({ name, email, role: 'admin' });
    const passwordHash = await bcrypt.hash(password, 10);
    await this.credentialsRepo.setPasswordHash(admin.id, passwordHash);
  }
}

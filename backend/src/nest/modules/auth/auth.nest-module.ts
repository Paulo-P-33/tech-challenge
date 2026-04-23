import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { UpdateOwnProfileUseCase } from '../../../core/users/use-cases/update-own-profile.usecase';
import { UpdateUserAvatarUseCase } from '../../../core/users/use-cases/update-user-avatar.usecase';
import { PrismaPersistenceModule } from '../../persistence/prisma-persistence.module';
import { CoreProvidersModule } from '../../shared/core-providers.module';
import { TOKENS } from '../../shared/tokens';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaPersistenceModule,
    CoreProvidersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: CreateUserUseCase,
      inject: [TOKENS.usersRepo, TOKENS.idGenerator, TOKENS.clock],
      useFactory: (repo, id, clock) => new CreateUserUseCase(repo, id, clock),
    },
    {
      provide: UpdateOwnProfileUseCase,
      inject: [TOKENS.usersRepo],
      useFactory: (repo) => new UpdateOwnProfileUseCase(repo),
    },
    {
      provide: UpdateUserAvatarUseCase,
      inject: [TOKENS.usersRepo],
      useFactory: (repo) => new UpdateUserAvatarUseCase(repo),
    },
    AuthService,
    JwtStrategy,
  ],
})
export class AuthNestModule {}

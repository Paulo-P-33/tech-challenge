import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CoreProvidersModule } from '../../shared/core-providers.module';
import { TOKENS } from '../../shared/tokens';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PersistenceModule,
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
    AuthService,
    JwtStrategy,
  ],
})
export class AuthNestModule {}

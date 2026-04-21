import { Module } from '@nestjs/common';

import { CreateUserUseCase } from '../../../core/users/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../../core/users/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../../core/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../../core/users/use-cases/list-users.usecase';
import { PrismaPersistenceModule } from '../../persistence/prisma-persistence.module';
import { CoreProvidersModule } from '../../shared/core-providers.module';
import { TOKENS } from '../../shared/tokens';

import { UsersController } from './users.controller';

@Module({
  imports: [PrismaPersistenceModule, CoreProvidersModule],
  controllers: [UsersController],
  providers: [
    {
      provide: CreateUserUseCase,
      inject: [TOKENS.usersRepo, TOKENS.idGenerator, TOKENS.clock],
      useFactory: (repo, id, clock) => new CreateUserUseCase(repo, id, clock),
    },
    {
      provide: ListUsersUseCase,
      inject: [TOKENS.usersRepo],
      useFactory: (repo) => new ListUsersUseCase(repo),
    },
    {
      provide: GetUserUseCase,
      inject: [TOKENS.usersRepo],
      useFactory: (repo) => new GetUserUseCase(repo),
    },
    {
      provide: DeleteUserUseCase,
      inject: [TOKENS.usersRepo],
      useFactory: (repo) => new DeleteUserUseCase(repo),
    },
  ],
})
export class UsersNestModule {}

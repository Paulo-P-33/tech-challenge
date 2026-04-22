import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ListAuditLogsUseCase } from '../../../core/audit-logs/use-cases/list-audit-logs.usecase';
import { LogActionUseCase } from '../../../core/audit-logs/use-cases/log-action.usecase';
import { PrismaPersistenceModule } from '../../persistence/prisma-persistence.module';
import { CoreProvidersModule } from '../../shared/core-providers.module';
import { AuditInterceptor } from '../../shared/audit.interceptor';
import { TOKENS } from '../../shared/tokens';

import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [PrismaPersistenceModule, CoreProvidersModule],
  controllers: [AuditLogsController],
  providers: [
    {
      provide: LogActionUseCase,
      inject: [TOKENS.auditLogsRepo, TOKENS.idGenerator, TOKENS.clock],
      useFactory: (repo, id, clock) => new LogActionUseCase(repo, id, clock),
    },
    {
      provide: ListAuditLogsUseCase,
      inject: [TOKENS.auditLogsRepo],
      useFactory: (repo) => new ListAuditLogsUseCase(repo),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AuditLogsNestModule {}

import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ListAuditLogsUseCase } from '../../../core/audit-logs/use-cases/list-audit-logs.usecase';
import { DomainExceptionFilter } from '../../shared/domain-exception.filter';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { presentAuditLog } from './audit-logs.presenter';

const auditLogSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string', nullable: true },
    userEmail: { type: 'string', nullable: true },
    action: { type: 'string' },
    targetType: { type: 'string', nullable: true },
    targetId: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseFilters(DomainExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('/audit-logs')
export class AuditLogsController {
  constructor(private readonly listAuditLogs: ListAuditLogsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os logs de auditoria (apenas admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Lista de logs de auditoria, ordenada do mais recente ao mais antigo',
    schema: { type: 'array', items: auditLogSchema },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  async list() {
    const logs = await this.listAuditLogs.execute();
    return logs.map(presentAuditLog);
  }
}

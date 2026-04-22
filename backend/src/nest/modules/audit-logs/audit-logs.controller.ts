import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description:
      'Lista paginada de logs de auditoria, ordenada do mais recente ao mais antigo',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: auditLogSchema },
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — role admin necessária',
  })
  async list(@Query() query: unknown) {
    const { page, limit } = paginationQuerySchema.parse(query);
    const result = await this.listAuditLogs.execute({ page, limit });
    return { ...result, data: result.data.map(presentAuditLog) };
  }
}

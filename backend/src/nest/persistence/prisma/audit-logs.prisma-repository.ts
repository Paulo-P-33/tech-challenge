import { Injectable } from '@nestjs/common';

import { AuditLog } from '../../../core/audit-logs/audit-log.entity';
import type { AuditLogsRepository } from '../../../core/audit-logs/audit-logs.repository';

import { PrismaService } from './prisma.service';

@Injectable()
export class AuditLogsPrismaRepository implements AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(log: AuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: log.id,
        userId: log.userId,
        userEmail: log.userEmail,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        createdAt: log.createdAt,
      },
    });
  }

  async list(): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) =>
      AuditLog.create({
        id: row.id,
        userId: row.userId,
        userEmail: row.userEmail,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        createdAt: row.createdAt,
      }),
    );
  }
}

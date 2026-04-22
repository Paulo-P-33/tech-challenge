import { Injectable } from '@nestjs/common';

import { AuditLog } from '../../../core/audit-logs/audit-log.entity';
import type { AuditLogsRepository } from '../../../core/audit-logs/audit-logs.repository';
import type {
  Paginated,
  PaginationParams,
} from '../../../core/shared/pagination';

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

  async list({ page, limit }: PaginationParams): Promise<Paginated<AuditLog>> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);
    return {
      data: rows.map((row) =>
        AuditLog.create({
          id: row.id,
          userId: row.userId,
          userEmail: row.userEmail,
          action: row.action,
          targetType: row.targetType,
          targetId: row.targetId,
          createdAt: row.createdAt,
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

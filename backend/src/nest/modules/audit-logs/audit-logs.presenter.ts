import type { AuditLog } from '../../../core/audit-logs/audit-log.entity';

export function presentAuditLog(log: AuditLog) {
  return {
    id: log.id,
    userId: log.userId,
    userEmail: log.userEmail,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    createdAt: log.createdAt.toISOString(),
  };
}

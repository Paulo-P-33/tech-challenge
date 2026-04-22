import type { AuditLog } from './audit-log.entity';

export interface AuditLogsRepository {
  create(log: AuditLog): Promise<void>;
  list(): Promise<AuditLog[]>;
}

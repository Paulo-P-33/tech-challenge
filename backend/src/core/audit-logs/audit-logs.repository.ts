import type { Paginated, PaginationParams } from '../shared/pagination';

import type { AuditLog } from './audit-log.entity';

export interface AuditLogsRepository {
  create(log: AuditLog): Promise<void>;
  list(pagination: PaginationParams): Promise<Paginated<AuditLog>>;
}

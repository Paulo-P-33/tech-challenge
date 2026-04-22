import type { AuditLog } from '../audit-log.entity';
import type { AuditLogsRepository } from '../audit-logs.repository';

export class ListAuditLogsUseCase {
  constructor(private readonly repo: AuditLogsRepository) {}

  async execute(): Promise<AuditLog[]> {
    return this.repo.list();
  }
}

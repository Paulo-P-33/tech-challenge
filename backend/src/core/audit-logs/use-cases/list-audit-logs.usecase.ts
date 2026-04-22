import type { Paginated, PaginationParams } from '../../shared/pagination';
import type { AuditLog } from '../audit-log.entity';
import type { AuditLogsRepository } from '../audit-logs.repository';

export class ListAuditLogsUseCase {
  constructor(private readonly repo: AuditLogsRepository) {}

  async execute(pagination: PaginationParams): Promise<Paginated<AuditLog>> {
    return this.repo.list(pagination);
  }
}

import type { Clock } from '../../shared/clock';
import type { IdGenerator } from '../../shared/id';
import { AuditLog } from '../audit-log.entity';
import type { AuditLogsRepository } from '../audit-logs.repository';

export interface LogActionInput {
  userId: string | null;
  userEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
}

export class LogActionUseCase {
  constructor(
    private readonly repo: AuditLogsRepository,
    private readonly id: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: LogActionInput): Promise<void> {
    const log = AuditLog.create({
      id: this.id(),
      userId: input.userId,
      userEmail: input.userEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      createdAt: this.clock(),
    });
    await this.repo.create(log);
  }
}

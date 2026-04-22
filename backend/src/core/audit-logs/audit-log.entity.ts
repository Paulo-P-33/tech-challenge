export type AuditLogId = string;

export interface AuditLogProps {
  id: AuditLogId;
  userId: string | null;
  userEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: Date;
}

export class AuditLog {
  private props: AuditLogProps;

  private constructor(props: AuditLogProps) {
    this.props = props;
  }

  static create(props: AuditLogProps): AuditLog {
    return new AuditLog(props);
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get userEmail() { return this.props.userEmail; }
  get action() { return this.props.action; }
  get targetType() { return this.props.targetType; }
  get targetId() { return this.props.targetId; }
  get createdAt() { return this.props.createdAt; }
}

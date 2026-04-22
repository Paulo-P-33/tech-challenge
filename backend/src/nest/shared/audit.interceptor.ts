import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LogActionUseCase } from '../../core/audit-logs/use-cases/log-action.usecase';

import { type AuditMeta, AUDIT_KEY } from './audit.decorator';

type AuthedUser = { id: string; email: string };
type RequestWithUser = {
  user?: AuthedUser;
  params?: Record<string, string>;
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logAction: LogActionUseCase,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    return next.handle().pipe(
      tap((responseData: unknown) => {
        const res = responseData as Record<string, unknown> | null;
        const resUser = res?.['user'] as Partial<AuthedUser> | undefined;

        const userId = request.user?.id ?? resUser?.id ?? null;
        const userEmail = request.user?.email ?? resUser?.email ?? null;
        const targetId =
          request.params?.['id'] ?? (res?.['id'] as string | undefined) ?? null;

        void this.logAction.execute({
          userId,
          userEmail,
          action: meta.action,
          targetType: meta.targetType ?? null,
          targetId,
        });
      }),
    );
  }
}

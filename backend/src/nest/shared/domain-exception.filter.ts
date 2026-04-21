import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ConflictError, NotFoundError, ValidationError } from '../../core/shared/errors';

@Catch(ConflictError, NotFoundError, ValidationError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<{ status: (code: number) => any; json: (body: unknown) => any }>();

    const statusCode =
      exception instanceof NotFoundError
        ? 404
        : exception instanceof ConflictError
          ? 409
          : exception instanceof ValidationError
            ? 400
            : 500;

    return res.status(statusCode).json({
      error: exception.name,
      message: exception.message,
      statusCode,
    });
  }
}


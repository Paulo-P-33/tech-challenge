import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<{
      status: (code: number) => any;
      json: (body: unknown) => any;
    }>();

    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request body',
      statusCode: 400,
      issues: exception.issues,
    });
  }
}

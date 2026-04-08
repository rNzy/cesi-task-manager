import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = req;
    const body = (req.body || {}) as Record<string, unknown>;
    const userAgent = req.get('user-agent') || '';
    const now = Date.now();

    this.logger.log(
      `[REQ] ${method} ${originalUrl} — ${userAgent}` +
        (Object.keys(body).length > 0
          ? ` — Body: ${JSON.stringify(body)}`
          : ''),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - now;
          this.logger.log(
            `[RES] ${method} ${originalUrl} — ${res.statusCode} — ${duration}ms`,
          );
        },
        error: (error: Error & { status?: number }) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[ERR] ${method} ${originalUrl} — ${error.status || 500} — ${duration}ms — ${error.message}`,
          );
        },
      }),
    );
  }
}

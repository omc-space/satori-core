import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { TOKEN_FIELD_NAME } from '~/constants/system.constant'
import { AuthService } from '~/modules/auth/auth.service'
import { LogService } from '~/modules/log/log.service'
import { getClientIp } from 'request-ip'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(LogService)
    private readonly logService: LogService,
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}
  use(req: FastifyRequest, res: FastifyReply['raw'], next: () => void) {
    if (req.method === 'OPTIONS') {
      next()
      return
    }
    const ip = getClientIp(req)
    const ua =
      req.headers['user-agent'] || (req.headers['User-Agent'] as string)
    this.authService
      .verifyToken(req.headers[TOKEN_FIELD_NAME] as string)
      .catch(() => {
        if (!req.originalUrl.startsWith('/log'))
          this.logService.create({
            ip,
            ua,
            path: req.originalUrl,
            method: req.method,
          })
      })

    this.logger.log(`Request: ${req.method} ${req.originalUrl}`)
    next()
  }
}

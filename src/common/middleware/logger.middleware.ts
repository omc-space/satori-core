import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import type { FastifyRequest, FastifyReply } from 'fastify'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: Logger) {}
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    this.logger.log(`Request: ${req.method} ${req.url}`)
    next()
  }
}

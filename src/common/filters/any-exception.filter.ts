import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getIp } from '~/utils'

type myError = {
  readonly status: number
  readonly statusCode?: number

  readonly message?: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    const status =
      (exception as any)?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
    const message =
      (exception as any)?.response?.message ||
      (exception as myError)?.message ||
      ''

    const res = (exception as any).response
    const ip = getIp(request)
    const url = request.url

    this.logger.warn(
      `IP: ${ip} 错误信息：(${status}) ${message} Path: ${decodeURI(url)}`,
    )
    response
      .status(status)
      .type('application/json')
      .send({
        ok: 0,
        code: status,
        path: request.url,
        message: res?.message || (exception as any)?.message || '未知错误',
        timestamp: new Date().toISOString(),
      })
  }
}

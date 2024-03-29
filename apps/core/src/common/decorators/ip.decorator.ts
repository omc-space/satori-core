import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { getClientIp } from 'request-ip'

export const IpLocation = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    const ip = getClientIp(request)
    const agent = request.headers['user-agent'] || request.headers['User-Agent']
    return {
      ip,
      agent,
    }
  },
)

export type IpRecord = {
  ip: string
  agent: string
}

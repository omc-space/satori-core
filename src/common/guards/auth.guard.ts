import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { FastifyRequest } from 'fastify'
import { TOKEN_FIELD_NAME } from '~/constants/system.constant'
import { AuthService } from '~/modules/auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const token = request.headers[TOKEN_FIELD_NAME] as string

    if (!token) {
      throw new UnauthorizedException('未登录')
    }

    const payload = await this.authService.verifyToken(token)
    request['user'] = payload

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}

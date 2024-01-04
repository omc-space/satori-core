import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JWT_CONSTANTS } from '~/constants/system.constant'
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
    // try {
    const payload = await this.authService.verifyToken(token)
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    request['user'] = payload
    // } catch {
    //   throw new UnauthorizedException('验证失败')
    // }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}

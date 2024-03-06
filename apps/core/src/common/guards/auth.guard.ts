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
import { UserModel } from '~/modules/user/user.model'
import { UserService } from '~/modules/user/user.service'
import { FastifyBizRequest } from '~/transformers/get-req.transformer'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected authService: AuthService,
    protected readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const token = request.headers[TOKEN_FIELD_NAME] as string
    if (!token) {
      throw new UnauthorizedException('未登录')
    }

    await this.authService.verifyToken(token)
    this.attachUserAndToken(request, await this.userService.getMaster(), token)

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }

  attachUserAndToken(
    request: FastifyBizRequest,
    user: UserModel,
    token: string,
  ) {
    request.user = user
    request.token = token

    Object.assign(request.raw, {
      user,
      token,
    })
  }
}

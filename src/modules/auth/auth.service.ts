import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '~/modules/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { TOKEN_FIELD_NAME } from '~/constants/system.constant'
import { logger } from '~/global/consola.global'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}
  async generateToken(payload) {
    return {
      [TOKEN_FIELD_NAME]: await this.jwtService.signAsync(payload),
    }
  }

  async verifyToken(token: string) {
    if (!token) {
      logger.error('token不存在,当前未登录')
      throw new UnauthorizedException('当前未登录')
    }
    let payload: any
    try {
      payload = await this.jwtService.verifyAsync(token)
    } catch (err) {
      // 验证失败
      logger.error('token验证失败')
    }
    return payload
  }
}

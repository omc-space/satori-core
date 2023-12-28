import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '~/modules/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { TOKEN_FIELD_NAME } from '~/constants/system.constant'

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
      throw new UnauthorizedException('当前未登录')
    }
    let payload: any
    try {
      payload = await this.jwtService.verifyAsync(token)
    } catch (err) {
      // 验证失败
      console.log(err)
    }
    return payload
  }
}

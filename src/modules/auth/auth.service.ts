import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '~/modules/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { TOKEN_FIELD_NAME } from '~/constants/system.constant'
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async generateToken(payload) {
    return {
      [TOKEN_FIELD_NAME]: await this.jwtService.signAsync(payload),
    }
  }

  async verifyToken(token: string) {
    return await this.jwtService.verifyAsync(token)
  }
}

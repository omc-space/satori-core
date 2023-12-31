import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserModel as User } from '../user/user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from '~/common/decorators/inject.model.decorator'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}
  async generateToken(payload) {
    return await this.jwtService.signAsync(payload)
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('当前未登录')
    }
    let payload: any
    try {
      payload = await this.jwtService.verifyAsync(token)
    } catch (err) {
      throw new UnauthorizedException('token验证失败')
    }
    const { username } = await this.userModel.findOne()
    if (payload.username !== username) {
      throw new UnauthorizedException('token验证失败,用户不存在')
    }
    return payload
  }
}

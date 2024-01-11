import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserModel as User } from '../user/user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { isJWT } from 'class-validator'

export type JwtPayload = {
  id: string
  username?: string
  ip?: string
  ua?: string
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}
  async generateToken(payload: JwtPayload) {
    return await this.jwtService.signAsync(payload)
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('当前未登录')
    }
    if (!isJWT(token)) {
      throw new UnauthorizedException('令牌无效')
    }
    let payload: any
    try {
      payload = await this.jwtService.verifyAsync(token)
    } catch (err) {
      throw new UnauthorizedException('身份过期')
    }
    const { id } = await this.userModel.findOne()
    if (payload.id !== id) {
      throw new UnauthorizedException('身份验证失败,好像不是主人哦')
    }
    return payload
  }
}

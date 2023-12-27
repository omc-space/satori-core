import { Module } from '@nestjs/common'
import { UserModel } from '../user/user.model'
import { JwtModule } from '@nestjs/jwt'
import { JWT_CONSTANTS } from '~/constants/system.constant'

@Module({
  imports: [
    UserModel,
    JwtModule.register({
      global: true,
      secret: JWT_CONSTANTS.secret,
      signOptions: { expiresIn: JWT_CONSTANTS.expiresIn }, // 设置token过期时间
    }),
  ],
})
export class AuthModule {}

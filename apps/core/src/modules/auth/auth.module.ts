import { Global, Module, forwardRef } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { JwtModule } from '@nestjs/jwt'
import { JWT_CONSTANTS } from '~/constants/system.constant'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: JWT_CONSTANTS.secret,
      signOptions: { expiresIn: JWT_CONSTANTS.expiresIn }, // 设置token过期时间
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

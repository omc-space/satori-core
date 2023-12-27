import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { UserModule } from '~/modules/user/user.module'
import { ConfigModule } from '@nestjs/config'
import { DbModule } from '@app/db'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AuthController } from './modules/auth/auth.controller'
import { AuthService } from './modules/auth/auth.service'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule.forRoot(),
    DbModule.forFeature(),
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    AuthService,
  ],
})
export class AppModule {}

import { Logger, MiddlewareConsumer, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { UserModule } from '~/modules/user/user.module'
import { ConfigModule } from '@nestjs/config'
import { DbModule } from '@app/db'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AuthController } from './modules/auth/auth.controller'
import { AuthModule } from './modules/auth/auth.module'
import { LoggerMiddleware } from './common/middleware/logger.middleware'
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule.forRoot(),
    DbModule.forFeature(),
    PostModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}

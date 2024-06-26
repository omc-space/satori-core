import { Logger, MiddlewareConsumer, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { UserModule } from '~/modules/user/user.module'
import { ConfigModule } from '@nestjs/config'
import { DbModule } from '~/modules/database/db.module'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AuthModule } from './modules/auth/auth.module'
import { LoggerMiddleware } from './common/middlewares/logger.middleware'
import { PostModule } from './modules/post/post.module'
import { CategoryModule } from './modules/category/category.module'
import { NoteModule } from './modules/note/note.module'
import { TopicModule } from './modules/topic/topic.module'
import { RequestContextMiddleware } from './common/middlewares/request-context.middleware'
import { RolesGuard } from './common/guards/roles.guard'
import { ThrottlerGuard } from '@nestjs/throttler'
import { ConfigsModule } from './modules/configs/configs.module'
import { CommentModule } from './modules/comment/comment.module'
import { SayModule } from './modules/say/say.module'
import { RedisModule } from './modules/redis/redis.module'
import { OptionModule } from './modules/option/option.module'
import { HelperModule } from './shared/helper/helper.module'
import { LinkModule } from './modules/link/link.module'
import { ImageModule } from './modules/image/image.module'
import { SystemModule } from './modules/system/system.module'
import { AggregateModule } from './modules/aggregate/aggregate.module'
import { LogModule } from './modules/log/log.module'
import { CountModule } from './modules/count/count.module'
import { IdempotenceInterceptor } from './common/interceptors/idempotence.interceptor'
import { PageModule } from './modules/page/page.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule.forRoot(),
    DbModule.forFeature(),
    AuthModule,
    UserModule,
    PostModule,
    CategoryModule,
    NoteModule,
    TopicModule,
    ConfigsModule,
    CommentModule,
    SayModule,
    RedisModule,
    OptionModule,
    HelperModule,
    LinkModule,
    ImageModule,
    SystemModule,
    AggregateModule,
    LogModule,
    CountModule,
    PageModule,
  ],
  controllers: [AppController],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotenceInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, RequestContextMiddleware).forRoutes('*')
  }
}

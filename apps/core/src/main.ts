import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import wcmatch from './utils/wcmatch'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { generateDocument } from './utils/swagger'
import { ValidationPipe } from '@nestjs/common'
import { isDev, CROSS_DOMAIN } from './app.config'
import logger from '~/global/consola.global'
import { registerJSONGlobal } from './global/json.global'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger },
  )

  generateDocument(app)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: 422,
      forbidUnknownValues: true,
      enableDebugMessages: isDev,
      stopAtFirstError: true,
    }),
  )
  const Origin: false | string[] = Array.isArray(CROSS_DOMAIN.allowedOrigins)
    ? [...CROSS_DOMAIN.allowedOrigins, '*.dvaren.xyz']
    : false
  // Origin 如果不是数组就全部允许跨域
  app.enableCors(
    isDev
      ? undefined
      : Origin
        ? {
            origin: (origin, callback) => {
              // 浏览器直接访问时为undefined
              if (!origin) {
                return callback(null, true)
              }
              let currentHost: string
              try {
                currentHost = new URL(origin).host
              } catch {
                currentHost = origin
              }
              const allow = Origin.some((host) =>
                wcmatch(host, {})(currentHost),
              )

              callback(null, allow)
            },
            credentials: true,
          }
        : undefined,
  )
  registerJSONGlobal()
  await app.listen(2333)
}
bootstrap()

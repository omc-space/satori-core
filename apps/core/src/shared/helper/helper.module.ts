import type { Provider } from '@nestjs/common'

import { forwardRef, Global, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ThrottlerModule } from '@nestjs/throttler'

import { NoteModule } from '~/modules/note/note.module'
import { PostModule } from '~/modules/post/post.module'

import { AssetService } from './helper.asset.service'
import { EmailService } from './helper.email.service'
import { HttpService } from './helper.http.service'
import { EventManagerService } from './helper.event.service'
import { isDev } from '~/app.config'

const providers: Provider<any>[] = [
  AssetService,
  EmailService,
  HttpService,
  EventManagerService,
]

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 20,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: isDev,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 50,
      },
    ]),
    forwardRef(() => PostModule),
    forwardRef(() => NoteModule),
  ],
  providers,
  exports: providers,
})
@Global()
export class HelperModule {}

// https://github.dev/ever-co/ever-gauzy/packages/core/src/core/context/request-context.middleware.ts

import * as cls from 'cls-hooked'
import type { NestMiddleware } from '@nestjs/common'
import type { IncomingMessage, ServerResponse } from 'http'

import { Injectable } from '@nestjs/common'

import { RequestContext } from '../contexts/request.context'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: IncomingMessage, res: ServerResponse, next: () => any) {
    const requestContext = new RequestContext(req, res)
    if (req.method === 'OPTIONS') {
      next()
      return
    }
    const session =
      cls.getNamespace(RequestContext.name) ||
      cls.createNamespace(RequestContext.name)

    session.run(async () => {
      session.set(RequestContext.name, requestContext)
      next()
    })
  }
}

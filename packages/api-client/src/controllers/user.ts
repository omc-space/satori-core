import { IRequestAdapter } from '../interfaces/adapter'
import { IController } from '../interfaces/controller'
import { HTTPClient } from '../core/client'
import { autoBind } from '../utils/auto-bind'

declare module '../core/client' {
  interface HTTPClient<
    T extends IRequestAdapter = IRequestAdapter,
    ResponseWrapper = unknown,
  > {
    user: UserController<ResponseWrapper>
    master: UserController<ResponseWrapper>
  }
}

export class UserController<ResponseWrapper> implements IController {
  base = 'master'
  name = ['user', 'master']

  constructor(private readonly client: HTTPClient) {
    autoBind(this)
  }
  getMaster() {
    return 'master'
  }
}

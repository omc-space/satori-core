import { Class } from '../interfaces/types'
import { allControllerNames, allControllers } from '../controllers'
import { IRequestAdapter } from '../interfaces/adapter'
import { IClientOptions } from '../interfaces/client'
import { IController } from '../interfaces/controller'
const methodPrefix = '_$'

export type { HTTPClient }

class HTTPClient<
  T extends IRequestAdapter = IRequestAdapter,
  ResponseWrapper = unknown,
> {
  constructor(
    private _endpoint: string,
    private _adaptor: T,
    private options?: IClientOptions,
  ) {
    this.initGetClient()
  }

  get instance() {
    return this._adaptor
  }

  private initGetClient() {
    for (const name of allControllerNames) {
      Object.defineProperty(this, name, {
        get() {
          const client: any = Reflect.get(this, `${methodPrefix}${name}`)
          if (!client) {
            throw new ReferenceError(
              `${
                name.charAt(0).toUpperCase() + name.slice(1)
              } Client not inject yet, please inject with client.injectClients(...)`,
            )
          }
          return client
        },
        configurable: false,
        enumerable: false,
      })
    }
  }

  public injectControllers(...Controller: Class<IController>[]): void
  public injectControllers(Controller: Class<IController>[]): void
  public injectControllers(Controller: any, ...rest: any[]) {
    Controller = Array.isArray(Controller) ? Controller : [Controller, ...rest]
    for (const Client of Controller) {
      const cl = new Client(this)

      if (Array.isArray(cl.name)) {
        for (const name of cl.name) {
          attach.call(this, name, cl)
        }
      } else {
        attach.call(this, cl.name, cl)
      }
    }

    function attach(this: any, name: string, cl: IController) {
      Object.defineProperty(this, `${methodPrefix}${name.toLowerCase()}`, {
        get() {
          return cl
        },
        enumerable: false,
        configurable: false,
      })
    }
  }
}
export function createClient<T extends IRequestAdapter = IRequestAdapter>(
  adapter: T,
  endpoint: string,
  options?: IClientOptions,
) {
  const client = new HTTPClient(endpoint, adapter, options)
  client.injectControllers(allControllers)
  return client
}

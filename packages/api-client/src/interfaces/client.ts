import { IController } from './controller'
import { Class } from './types'

export interface IClientOptions {
  controllers: Class<IController>[]
  getCodeMessageFromException?: <T = Error>(
    error: T,
  ) => {
    message?: string | undefined | null
    code?: string | undefined | null
  }
  customThrowResponseError: <T extends Error = Error>(err: any) => T
  transformResponse: <T = any>(data: any) => T
}

export type ClientOptions = Partial<IClientOptions>

export interface IClientOptions {
  getCodeMessageFromException?: <T = Error>(
    error: T,
  ) => {
    message?: string | undefined | null
    code?: string | undefined | null
  }
  customThrowResponseError: <T extends Error = Error>(err: any) => T
  transformResponse: <T = any>(data: any) => T
}

import { AxiosRequestConfig } from 'axios'

export const MONGO_DB = {
  dbName: 'satori',
  host: '127.0.0.1',
  // host: argv.db_host || '10.0.0.33',
  port: 27017,
  user: '',
  password: '',
  get uri() {
    const userPassword =
      this.user && this.password ? `${this.user}:${this.password}@` : ''
    return `mongodb://${userPassword}${this.host}:${this.port}/${this.dbName}`
  },
}

export const API_VERSION = 1

export const AXIOS_CONFIG: AxiosRequestConfig = {
  timeout: 10000,
}
export const ENCRYPT = {
  key: 'encrypt-key',
  enable: true,
  algorithm: 'aes-256-ecb',
}

export const isDev = process.env.NODE_ENV === 'development'

export const REDIS = {
  host: 'localhost',
  port: 6379,
  password: null,
  ttl: null,
  httpCacheTTL: 15,
  max: 120,
  disableApiCache: isDev,
}

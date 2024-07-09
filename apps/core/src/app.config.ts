import { AxiosRequestConfig } from 'axios'

export const MONGO_DB = {
  dbName: process.env.collection_name || 'satori',
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: process.env.DATABASE_PORT || 27017,
  user: process.env.DATABASE_USER || '',
  password: process.env.DATABASE_PASSWORD || '',
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

export const CROSS_DOMAIN = {
  allowedOrigins: [
    'dvaren.xyz',
    '*.dvaren.xyz',
    'dvaren.xyz',
    '*.dvaren.xyz',
    'localhost:*',
    '127.0.0.1',
    '*.dev',
    '*.vercel.app',
    'dvaren.cn',
    '*.dvaren.cn',
  ],

  // allowedReferer: 'innei.ren',
}

export const CLUSTER = {
  enable: false,
  workers: 'cluster_workers',
}

export const SECURITY = {
  jwtSecret: 'cnasnodcnoncqsca2239',
  jwtExpire: 14,
}

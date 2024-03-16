import { DynamicModule, Provider } from '@nestjs/common'
import { DB_CONNECTION_TOKEN } from '~/constants/system.constant'
import { mongoose } from '@typegoose/typegoose'
import { dbProviders } from './db.providers'

export type ClassType = { new (...args): any }

export class DbModule {
  static forRoot(uri?: string, options = {}): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DB_CONNECTION_TOKEN,
        useFactory: () => {
          const MONGO_DB = {
            dbName: process.env.collection_name || 'satori',
            host: process.env.DATABASE_HOST || '127.0.0.1',
            port: process.env.DATABASE_PORT || 27017,
            user: process.env.DATABASE_USER || '',
            password: process.env.DATABASE_PASSWORD || '',
            get uri() {
              const userPassword =
                this.user && this.password
                  ? `${this.user}:${this.password}@`
                  : ''
              return `mongodb://${userPassword}${this.host}:${this.port}/${this.dbName}`
            },
          }
          return mongoose.connect(uri || MONGO_DB.uri, options)
        },
      },
    ]

    return {
      module: DbModule,
      providers,
      exports: providers,
      global: true,
    }
  }

  static forFeature(): DynamicModule {
    return {
      module: DbModule,
      providers: dbProviders,
      exports: dbProviders,
      global: true,
    }
  }
}

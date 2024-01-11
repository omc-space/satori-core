import { DynamicModule, Provider } from '@nestjs/common'
import { DB_CONNECTION_TOKEN } from '~/constants/system.constant'
import { mongoose } from '@typegoose/typegoose'
import { MONGO_DB } from '~/app.config'
import { dbProviders } from './db.providers'

export type ClassType = { new (...args): any }

export class DbModule {
  static forRoot(uri?: string, options = {}): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DB_CONNECTION_TOKEN,
        useFactory: () => mongoose.connect(uri || MONGO_DB.uri, options),
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

import { DynamicModule, Module, Provider } from '@nestjs/common'
import { DbService } from './db.service'
import { DB_CONNECTION_TOKEN } from '~/constants/system.constant'
import { mongoose } from '@typegoose/typegoose'
import { MONGO_DB } from '~/app.config'
import { dbProviders } from './db.providers'

export type ClassType = { new (...args): any }

@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {
  static forRoot(uri?: string, options = {}): DynamicModule {
    console.log(MONGO_DB.uri)
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

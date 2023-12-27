import { Provider } from '@nestjs/common'
import { getModelForClass } from '@typegoose/typegoose'
import { User } from '~/user/user.model'

export const dbProviders: Provider[] = [User].map((model) => ({
  provide: model.name,
  useFactory: () => getModelForClass(model),
}))

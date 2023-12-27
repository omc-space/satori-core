import { Provider } from '@nestjs/common'
import { getModelForClass } from '@typegoose/typegoose'
import { UserModel } from '~/modules/user/user.model'

export const dbProviders: Provider[] = [UserModel].map((model) => ({
  provide: model.name,
  useFactory: () => getModelForClass(model),
}))

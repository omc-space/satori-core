import { Provider } from '@nestjs/common'
import { getModelForClass } from '@typegoose/typegoose'
import { getModelToken } from '~/common/decorators/inject.model.decorator'
import { UserModel } from '~/modules/user/user.model'

export const dbProviders: Provider[] = [UserModel].map((model) => ({
  provide: getModelToken(model.name),
  useFactory: () => getModelForClass(model),
}))

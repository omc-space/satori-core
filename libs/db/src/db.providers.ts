import { Provider } from '@nestjs/common'
import { getModelForClass } from '@typegoose/typegoose'
import { getModelToken } from '~/common/decorators/inject.model.decorator'
import { CategoryModel } from '~/modules/category/category.model'
import { PostModel } from '~/modules/post/post.model'
import { UserModel } from '~/modules/user/user.model'

export const dbProviders: Provider[] = [
  UserModel,
  CategoryModel,
  PostModel,
].map((model) => ({
  provide: getModelToken(model.name),
  useFactory: () => getModelForClass(model),
}))

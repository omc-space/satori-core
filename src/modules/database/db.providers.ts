import { Provider } from '@nestjs/common'
import { getModelForClass } from '@typegoose/typegoose'
import { getModelToken } from '~/common/decorators/inject.model.decorator'
import { CategoryModel } from '~/modules/category/category.model'
import { NoteModel } from '~/modules/note/note.model'
import { PostModel } from '~/modules/post/post.model'
import { TopicModel } from '~/modules/topic/topic.model'
import { UserModel } from '~/modules/user/user.model'
import { SayModel } from '../say/say.model'
import { CommentModel } from '../comment/comment.model'

export const dbProviders: Provider[] = [
  UserModel,
  CategoryModel,
  PostModel,
  TopicModel,
  NoteModel,
  SayModel,
  CommentModel,
].map((model) => ({
  provide: getModelToken(model.name),
  useFactory: () => getModelForClass(model),
}))

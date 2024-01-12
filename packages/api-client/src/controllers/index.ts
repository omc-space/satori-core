import { UserController } from './user'
import { NoteController } from './note'
import { CommentController } from './comment'
import { TopicController } from './topic'
import { SayController } from './say'
import { CategoryController } from './category'

export const allControllerNames = [
  'post',
  'note',
  'user',
  'master',
  'say',
  'comment',
  'topic',
  'category',
]

export const allControllers = [
  UserController,
  NoteController,
  CommentController,
  TopicController,
  SayController,
  CategoryController,
]

export {
  UserController,
  NoteController,
  CommentController,
  TopicController,
  SayController,
  CategoryController,
}

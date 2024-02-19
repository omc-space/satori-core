import { UserController } from './user'
import { NoteController } from './note'
import { CommentController } from './comment'
import { TopicController } from './topic'
import { SayController } from './say'
import { CategoryController } from './category'
import { PostController } from './post'

export const allControllerNames = [
  'post',
  'note',
  'user',
  'say',
  'comment',
  'topic',
  'category',

  // alias
  'master',
]

export const allControllers = [
  PostController,
  NoteController,
  UserController,
  SayController,
  CommentController,
  TopicController,
  CategoryController,
]

export {
  PostController,
  NoteController,
  UserController,
  SayController,
  CommentController,
  TopicController,
  CategoryController,
}

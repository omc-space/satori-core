import { NoteController } from './note'
import { UserController } from './user'
import { CommentController } from './comment'
import { SayController } from './say'
import { CategoryController } from './category'

export const allControllers = [
  UserController,
  NoteController,
  CommentController,
  SayController,
  CategoryController,
]

export const allControllerNames = [
  'category',
  'comment',
  'note',
  'post',
  'project',
  'topic',
  'say',
  'search',
  'user',
] as const

export {
  UserController,
  NoteController,
  CommentController,
  SayController,
  CategoryController,
}

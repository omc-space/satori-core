import { forwardRef, Module } from '@nestjs/common'

import { CategoryModule } from '../category/category.module'
import { CommentModule } from '../comment/comment.module'
import { LinkModule } from '../link/link.module'
import { NoteModule } from '../note/note.module'
import { PostModule } from '../post/post.module'
import { SayModule } from '../say/say.module'
import { AggregateController } from './aggregate.controller'
import { AggregateService } from './aggregate.service'

@Module({
  imports: [
    forwardRef(() => CategoryModule),
    forwardRef(() => PostModule),
    forwardRef(() => NoteModule),
    forwardRef(() => SayModule),
    forwardRef(() => CommentModule),
    forwardRef(() => LinkModule),
  ],
  providers: [AggregateService],
  exports: [AggregateService],
  controllers: [AggregateController],
})
export class AggregateModule {}

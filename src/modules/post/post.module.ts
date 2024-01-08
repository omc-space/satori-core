import { Module, forwardRef } from '@nestjs/common'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { CategoryModule } from '../category/category.module'
import { CommentModule } from '../comment/comment.module'

@Module({
  imports: [forwardRef(() => CategoryModule), CommentModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

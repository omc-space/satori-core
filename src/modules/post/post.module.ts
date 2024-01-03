import { Module, forwardRef } from '@nestjs/common'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { CategoryModule } from '../category/category.module'

@Module({
  imports: [forwardRef(() => CategoryModule)],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

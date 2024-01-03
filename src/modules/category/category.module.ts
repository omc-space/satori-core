import { Module, forwardRef } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { PostModule } from '../post/post.module'

@Module({
  imports: [forwardRef(() => PostModule)],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}

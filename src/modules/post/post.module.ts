import { Module } from '@nestjs/common'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { UserModel } from '../user/user.model'

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
  imports: [UserModel],
})
export class PostModule {}

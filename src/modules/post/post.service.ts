import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { PostModel } from './post.model'
import { CategoryService } from '../category/category.service'

@Injectable()
export class PostService {
  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
  ) {}
  async create(post: PostModel) {
    const { categoryId } = post
  }
}

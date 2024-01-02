import { Body, Controller, Post } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryModel } from './category.model'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/')
  async create(@Body() category: CategoryModel) {
    this.categoryService.create(category)
    return 'Category created'
  }
}

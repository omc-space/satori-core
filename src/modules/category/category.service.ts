import { Injectable } from '@nestjs/common'
import { CategoryModel } from './category.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryModel)
    private readonly categoryModel: ReturnModelType<typeof CategoryModel>,
  ) {}
  async create(category: CategoryModel) {
    this.categoryModel.create(category)
  }
}

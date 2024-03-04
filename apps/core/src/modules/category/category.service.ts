import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common'
import { CategoryModel, CategoryType } from './category.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { ReturnModelType } from '@typegoose/typegoose'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'
import { PostService } from '../post/post.service'
import { FilterQuery } from 'mongoose'
import { PostModel } from '../post/post.model'
import { CannotFindException } from '~/common/exceptions/cant-find.exception'
import { omit } from 'lodash'
import type { DocumentType } from '@typegoose/typegoose'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryModel)
    private readonly categoryModel: ReturnModelType<typeof CategoryModel>,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  get model() {
    return this.categoryModel
  }

  async create(category: CategoryModel) {
    const { name, slug } = category
    // 检查slug是否已存在
    const slugExists = await this.categoryModel.exists({
      name,
      slug: slug ?? name,
    })
    if (slugExists) {
      throw new BadRequestException('分类slug已存在')
    }
    category.slug = slug ?? name
    return await this.categoryModel.create(category)
  }

  async update(id: string, categoryDto: Partial<CategoryModel>) {
    const newDoc = await this.categoryModel.updateOne(
      {
        _id: id,
      },
      {
        ...categoryDto,
      },
      {
        new: true,
      },
    )

    return newDoc
  }

  async deleteById(id: string) {
    const category = await this.categoryModel.findById(id)
    if (!category) {
      throw new NoContentCanBeModifiedException()
    }

    const postsInCategory = await this.findPostsInCategory(category.id)
    if (postsInCategory.length > 0) {
      throw new BadRequestException('分类下存在文章，无法删除')
    }
    const res = await this.model.deleteOne({
      _id: category._id,
    })
    await this.createDefaultCategory()
    return res as any
  }

  async findAllCategories() {}

  async findCategoryById(categoryId: string) {
    const [category, count] = await Promise.all([
      this.categoryModel.findById(categoryId).lean(),
      this.postService.model.countDocuments({ categoryId }).lean(),
    ])
    return {
      ...category,
      count,
    }
  }

  async findPostsInCategory(categoryId: string) {
    return this.postService.model.find({ categoryId }).lean()
  }

  async findAllCategory() {
    const data = await this.model.find({ type: CategoryType.Category }).lean()
    const counts = await Promise.all(
      data.map((item) => {
        const id = item._id
        return this.postService.model.countDocuments({ categoryId: id })
      }),
    )

    for (let i = 0; i < data.length; i++) {
      Reflect.set(data[i], 'count', counts[i])
    }

    return data
  }

  async getPostTagsSum() {
    const data = await this.postService.model.aggregate([
      { $project: { tags: 1 } },
      {
        $unwind: '$tags',
      },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ])
    return data
  }

  async createDefaultCategory() {
    if ((await this.model.countDocuments()) === 0) {
      return await this.model.create({
        name: '默认分类',
        slug: 'default',
      })
    }
  }

  async findCategoryPost(categoryId: string, condition: any = {}) {
    return await this.postService.model
      .find({
        categoryId,
        ...condition,
      })
      .select('title created slug _id')
      .sort({ created: -1 })
  }

  async findArticleWithTag(
    tag: string,
    condition: FilterQuery<DocumentType<PostModel>> = {},
  ): Promise<null | any[]> {
    const posts = await this.postService.model
      .find(
        {
          tags: tag,
          ...condition,
        },
        undefined,
        { lean: true },
      )
      .populate('category')
    if (!posts.length) {
      throw new CannotFindException()
    }
    return posts.map(({ _id, title, slug, category, created }) => ({
      _id,
      title,
      slug,
      category: omit(category, ['count', '__v', 'created', 'modified']),
      created,
    }))
  }
}

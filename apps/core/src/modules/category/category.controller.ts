import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryModel, CategoryType } from './category.model'
import { HTTPDecorators } from '~/common/decorators/http.decorator'
import { MongoIdDto } from '~/shared/dto/id.dto'
import { MultiCategoriesQueryDto } from './category.dto'
import { PostService } from '../post/post.service'
import { Auth } from '~/common/decorators/auth.decorator'
import { ApiController } from '~/common/decorators/api-controller.decorator'
import { MultiQueryTagAndCategoryDto, SlugOrIdDto } from '../post/post.dto'
import { isValidObjectId } from 'mongoose'
import { CannotFindException } from '~/common/exceptions/cant-find.exception'

@ApiController('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly postService: PostService,
  ) {}

  @Post('/')
  @Auth()
  @HTTPDecorators.Idempotence()
  async create(@Body() category: CategoryModel) {
    await this.categoryService.create(category)
    return 'Category created'
  }

  @Get('/')
  async getCategories(@Query() query: MultiCategoriesQueryDto) {
    const { ids, joint, type = CategoryType.Category } = query // categories is category's mongo id
    if (ids) {
      const ignoreKeys = '-text -summary -hide -images -commentsIndex'
      if (joint) {
        const map = new Object()

        await Promise.all(
          ids.map(async (id) => {
            const item = await this.postService.model
              .find({ categoryId: id }, ignoreKeys)
              .sort({ created: -1 })
              .lean()
            map[id] = item
            return id
          }),
        )

        return { entries: map }
      } else {
        const map = new Object()

        await Promise.all(
          ids.map(async (id) => {
            const posts = await this.postService.model
              .find({ categoryId: id }, ignoreKeys)
              .sort({ created: -1 })
              .lean()
            const category = await this.categoryService.findCategoryById(id)
            map[id] = Object.assign({ ...category, children: posts })
            return id
          }),
        )

        return { entries: map }
      }
    }
    return type === CategoryType.Category
      ? await this.categoryService.findAllCategory()
      : await this.categoryService.getPostTagsSum()
  }

  @Put('/:id')
  @Auth()
  async modify(@Param() params: MongoIdDto, @Body() body: CategoryModel) {
    const { type, slug, name } = body
    const { id } = params
    await this.categoryService.update(id, {
      slug,
      type,
      name,
    })
    return await this.categoryService.model.findById(id)
  }

  @Delete('/:id')
  @Auth()
  async delete(@Param() params: MongoIdDto) {
    const { id } = params
    return await this.categoryService.deleteById(id)
  }

  @Get('/:query')
  async getCategoryById(
    @Param() { query }: SlugOrIdDto,
    @Query() { tag }: MultiQueryTagAndCategoryDto,
  ) {
    if (!query) {
      throw new BadRequestException()
    }
    if (tag === true) {
      return {
        tag: query,
        data: await this.categoryService.findArticleWithTag(query),
      }
    }

    const isId = isValidObjectId(query)
    const res = isId
      ? await this.categoryService.model
          .findById(query)
          .sort({ created: -1 })
          .lean()
      : await this.categoryService.model
          .findOne({ slug: query })
          .sort({ created: -1 })
          .lean()

    if (!res) {
      throw new CannotFindException()
    }

    const children =
      (await this.categoryService.findCategoryPost(res._id.toHexString(), {
        $and: [tag ? { tags: tag } : {}],
      })) || []
    return { data: { ...res, children } }
  }
}

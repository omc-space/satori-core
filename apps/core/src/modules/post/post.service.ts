import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Post,
  forwardRef,
} from '@nestjs/common'
import { PostModel } from './post.model'
import { CategoryService } from '../category/category.service'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '~/constants/error-code.constant'
import slugify from 'slugify'
import { getLessThanNow } from '~/utils/time.util'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'
import { isDefined } from 'class-validator'
import { omit } from 'lodash'
import type { AggregatePaginateModel, Document, Types } from 'mongoose'
import { CommentModel } from '../comment/comment.model'
import { CollectionRefTypes } from '~/constants/db.constant'
import { getImageMetaFromMd } from '~/utils/pic.util'
import { EventManagerService } from '~/shared/helper/helper.event.service'
import { BusinessEvents } from '~/constants/business-event.constant'

@Injectable()
export class PostService {
  constructor(
    @InjectModel(PostModel)
    private readonly postModel: MongooseModel<PostModel> &
      AggregatePaginateModel<PostModel & Document>,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    @InjectModel(CommentModel)
    private readonly commentModel: MongooseModel<CommentModel>,

    private readonly EventManger: EventManagerService,
  ) {}

  get model() {
    return this.postModel
  }

  async findPostById(id: string) {
    const post = await this.postModel.findById(id)
    if (!post) {
      throw new BadRequestException('文章不存在')
    }
    return post
  }

  async create(post: PostModel) {
    const { categoryId } = post
    const category = await this.categoryService.findCategoryById(
      categoryId.toString(),
    )
    if (!category) {
      throw new NotFoundException('分类丢失了')
    }

    const slug = post.slug ? slugify(post.slug) : slugify(post.title)
    if (!(await this.isAvailableSlug(slug))) {
      throw new BusinessException(ErrorCodeEnum.SlugNotAvailable)
    }

    const relatedIds = await this.checkRelated(post)
    post.related = relatedIds as any

    const images = await getImageMetaFromMd(post.text)
    const newPost = await this.postModel.create({
      ...post,
      slug,
      modified: null,
      images,
      created: getLessThanNow(post.created),
    })

    const doc = newPost.toJSON()

    //双向关联文章
    await this.relatedEachOther(doc, relatedIds)

    this.EventManger.emit(BusinessEvents.POST_CREATE, post.title)
    return doc
  }

  async updateById(id: string, post: Partial<PostModel>) {
    const oldPost = await this.postModel.findById(id)
    if (!oldPost) {
      throw new NoContentCanBeModifiedException()
    }
    const { categoryId } = post
    if (categoryId && oldPost.categoryId.toString() !== categoryId.toString()) {
      if (!this.categoryService.findCategoryById(categoryId.toString())) {
        throw new NotFoundException('分类不存在')
      }
    }

    // 只有修改了 text title slug 的值才触发更新 modified 的时间
    if ([post.text, post.title, post.slug].some((i) => isDefined(i))) {
      const now = new Date()

      post.modified = now
    }

    if (post.slug && post.slug !== oldPost.slug) {
      post.slug = slugify(post.slug)
      const isAvailableSlug = await this.isAvailableSlug(post.slug)

      if (!isAvailableSlug) {
        throw new BusinessException(ErrorCodeEnum.SlugNotAvailable)
      }
    }

    // 有关联文章
    const related = await this.checkRelated(post)
    if (related.length) {
      post.related = related.filter((id) => id !== oldPost.id) as any

      // 双向关联
      await this.relatedEachOther(oldPost, related)
    } else {
      await this.removeRelatedEachOther(oldPost)
      oldPost.related = []
    }
    if (post.text)
      oldPost.images = await getImageMetaFromMd(post.text, oldPost.images)
    Object.assign(
      oldPost,
      omit(post, PostModel.protectedKeys),
      post.created
        ? {
            created: getLessThanNow(post.created),
          }
        : {},
    )
    await oldPost.save()
    this.EventManger.emit(BusinessEvents.POST_UPDATE, oldPost.title)
    return oldPost.toObject()
  }

  async deletePostById(id: string) {
    const deletedPost = await this.postModel.findById(id).lean()
    if (!deletedPost) {
      throw new NoContentCanBeModifiedException()
    }
    await Promise.all([
      this.postModel.deleteOne({ _id: id }),
      //TODO: 删除评论
      this.removeRelatedEachOther(deletedPost),
    ])

    this.EventManger.emit(BusinessEvents.POST_DELETE, deletedPost.title)
  }

  async isAvailableSlug(slug: string) {
    return (await this.postModel.countDocuments({ slug })) === 0
  }

  async checkRelated<
    T extends Partial<Pick<PostModel, 'id' | 'related' | 'relatedId'>>,
  >(data: T): Promise<string[]> {
    const { relatedId } = data
    if (relatedId && relatedId.length) {
      const relatedPost = await this.postModel.find({
        _id: { $in: relatedId },
      })
      if (relatedPost.length !== relatedId.length) {
        throw new BadRequestException('关联文章不存在')
      } else {
        return relatedPost.map((i) => {
          if (i.related && (i.related as any as string[]).includes(data.id)) {
            throw new BadRequestException('文章不能关联自己')
          }
          return i.id
        })
      }
    }
    return []
  }

  async relatedEachOther(post: PostModel, relatedIds: string[]) {
    if (relatedIds.length) return
    const relatedPosts = await this.postModel.find({
      _id: { $in: relatedIds },
    })
    const postId = post.id
    await Promise.all(
      relatedPosts.map((i) => {
        i.related = i.related || []
        const set = new Set(i.related.map((i) => i.toString()) as string[])
        set.add(postId.toString())
        ;(i.related as any as string[]) = Array.from(set)
        return i.save()
      }),
    )
  }

  async removeRelatedEachOther(post: PostModel | null) {
    if (!post) return
    const postRelatedIds = (post.related as string[]) || []
    if (!postRelatedIds.length) {
      return
    }
    const relatedPosts = await this.postModel.find({
      _id: { $in: postRelatedIds },
    })
    const postId = post.id
    await Promise.all(
      relatedPosts.map((i) => {
        i.related = (i.related as any as Types.ObjectId[]).filter(
          (id) => id && id.toHexString() !== postId,
        ) as any
        return i.save()
      }),
    )
  }

  async getCategoryBySlug(slug: string) {
    return await this.categoryService.model.findOne({ slug })
  }

  async deletePost(id: string) {
    const deletedPost = await this.postModel.findById(id).lean()
    await Promise.all([
      this.model.deleteOne({ _id: id }),
      this.commentModel.deleteMany({
        ref: id,
        refType: CollectionRefTypes.Post,
      }),
      this.removeRelatedEachOther(deletedPost),
    ])
  }
}

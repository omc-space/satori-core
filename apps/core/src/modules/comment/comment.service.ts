import { BadRequestException, Injectable } from '@nestjs/common'
import { CommentModel, CommentState } from './comment.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { ReturnModelType } from '@typegoose/typegoose'
import { CollectionRefTypes } from '~/constants/db.constant'
import { NoteModel } from '../note/note.model'
import { PostModel } from '../post/post.model'
import { WriteBaseModel } from '~/shared/model/write.base.model'
import { Types } from 'mongoose'
import { getAvatar } from '~/utils/tools.util'
import { UserService } from '../user/user.service'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(CommentModel)
    private readonly commentModel: ReturnModelType<typeof CommentModel>,
    @InjectModel(NoteModel)
    private readonly noteModel: ReturnModelType<typeof NoteModel>,
    @InjectModel(PostModel)
    private readonly postModel: ReturnModelType<typeof PostModel>,

    private readonly userService: UserService,
  ) {}

  public get model() {
    return this.commentModel
  }

  getModelByRefType(
    type: CollectionRefTypes,
  ): ReturnModelType<typeof WriteBaseModel> {
    switch (type) {
      case CollectionRefTypes.Note:
        return this.noteModel
      case CollectionRefTypes.Post:
        return this.postModel
    }
  }

  async createComment(
    id: string,
    doc: Partial<CommentModel>,
    type: CollectionRefTypes,
  ) {
    let ref: (WriteBaseModel & { _id: any }) | null = null

    if (type) {
      const model = this.getModelByRefType(type)
      ref = await model.findById(id).lean()
    }
    if (!ref) {
      throw new BadRequestException('评论文章不存在')
    }
    const commentIndex = ref.commentsIndex ?? 0
    doc.key = `#${commentIndex + 1}`

    const comment = await this.commentModel.create({
      ...doc,
      state: CommentState.Unread,
      ref: new Types.ObjectId(id),
      refType: type,
    })

    return comment
  }

  async getComments({ page, size, state } = { page: 1, size: 10, state: 0 }) {
    const queryList = await (this.commentModel as any).paginate(
      { state },
      {
        select: '+ip +agent -children',
        page,
        limit: size,
        populate: [
          {
            path: 'parent',
            select: '-children',
          },
          {
            path: 'ref',
            select: 'title _id slug nid categoryId content',
          },
        ],
        sort: { created: -1 },
        autopopulate: false,
      },
    )

    await this.fillAndReplaceAvatarUrl(queryList.docs)

    return queryList
  }

  async fillAndReplaceAvatarUrl(comments: CommentModel[]) {
    const master = await this.userService.getMaster()

    comments.forEach(function process(comment) {
      if (typeof comment == 'string') {
        return
      }
      // 如果是 author 是站长，就用站长自己设定的头像替换
      if (comment.author === master.name) {
        comment.avatar = master.avatar || comment.avatar
      }

      // 如果不存在头像就
      if (!comment.avatar) {
        comment.avatar = getAvatar(comment.mail)
      }

      if (comment.children?.length) {
        comment.children.forEach((child) => {
          process(child as CommentModel)
        })
      }

      return comment
    })

    return comments
  }

  async appendIpLocation(id: string, ip: string) {
    if (!ip) {
      return
    }
    //TODO: 设置IpLocation
    // const { recordIpLocation } = await this.configsService.get('commentOptions')

    const model = await this.commentModel.findById(id).lean()
    if (!model) {
      return
    }

    // const location =
    //   `${result.countryName || ''}${
    //     result.regionName && result.regionName !== result.cityName
    //       ? `${result.regionName}`
    //       : ''
    //   }${result.cityName ? `${result.cityName}` : ''}` || undefined

    // if (location) await this.commentModel.updateOne({ _id: id }, { location })
  }

  async validAuthorName(author: string): Promise<void> {
    const isExist = await this.userService.model.findOne({
      name: author,
    })
    if (isExist) {
      throw new BadRequestException(
        '用户名与主人重名啦，但是你好像并不是我的主人唉',
      )
    }
  }

  async deleteComments(id: string) {
    const comment = await this.commentModel.findById(id).lean()
    if (!comment) {
      throw new NoContentCanBeModifiedException()
    }
    const { children, parent } = comment
    if (children && children.length > 0) {
      await Promise.all(
        children.map(async (id) => {
          await this.deleteComments(id as any as string)
        }),
      )
    }
    if (parent) {
      const parent = await this.commentModel.findById(comment.parent)
      if (parent) {
        await parent.updateOne({
          $pull: {
            children: comment._id,
          },
        })
      }
    }
    await this.commentModel.deleteOne({ _id: id })
  }
}

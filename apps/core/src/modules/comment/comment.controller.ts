import {
  Body,
  Get,
  Param,
  Post,
  Query,
  Req,
  Patch,
  Delete,
} from '@nestjs/common'
import { CommentService } from './comment.service'
import { PagerDto } from '~/shared/dto/pager.dto'
import { Auth } from '~/common/decorators/auth.decorator'
import { MongoIdDto } from '~/shared/dto/id.dto'
import { IsMaster } from '~/common/decorators/role.decorator'
import { CommentModel, CommentState } from './comment.model'
import { CannotFindException } from '~/common/exceptions/cant-find.exception'
import { HTTPDecorators, Paginator } from '~/common/decorators/http.decorator'
import { FilterQuery, Document } from 'mongoose'
import type { DocumentType } from '@typegoose/typegoose'
import { IpLocation, IpRecord } from '~/common/decorators/ip.decorator'
import { scheduleManager } from '~/utils/schedule.util'
import {
  CommentDto,
  CommentRefTypesDto,
  CommentStatePatchDto,
  TextOnlyDto,
} from './comment.dto'
import { BizException } from '~/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '~/constants/error-code.constant'
import { UserModel } from '../user/user.model'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'
import { isUndefined } from 'lodash'
import { ApiController } from '~/common/decorators/api-controller.decorator'

const NESTED_REPLY_MAX = 10
const idempotenceMessage = '哦吼，这句话你已经说过啦'
@ApiController('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/')
  @Auth()
  @Paginator
  async getRecentlyComments(@Query() query: PagerDto) {
    const { size = 10, page = 1, state = 0 } = query
    return await this.commentService.getComments({ size, page, state })
  }

  @Get('/:id')
  @Auth()
  async getComments(
    @Param() params: MongoIdDto,
    @IsMaster() isMaster: boolean,
  ) {
    const { id } = params

    const data: CommentModel | null = await this.commentService.model
      .findOne({
        _id: id,
      })
      .populate('parent')
      .lean()

    if (!data) {
      throw new CannotFindException()
    }
    if (data.isWhispers && !isMaster) {
      throw new CannotFindException()
    }

    await this.commentService.fillAndReplaceAvatarUrl([data])
    return data
  }

  // 面向 C 端的评论查询接口
  @Get('/ref/:id')
  @HTTPDecorators.Paginator
  async getCommentsByRefId(
    @Param() params: MongoIdDto,
    @Query() query: PagerDto,
    @IsMaster() isMaster: boolean,
  ) {
    const { id } = params
    const { page = 1, size = 10 } = query

    // TODO: 评论审查配置
    // const configs = await this.configsService.get('commentOptions')
    // const { commentShouldAudit } = configs
    const commentShouldAudit = false

    const $and: FilterQuery<CommentModel & Document<any, any, any>>[] = [
      {
        parent: undefined,
        ref: id,
      },
      {
        $or: commentShouldAudit
          ? [
              {
                state: CommentState.Read,
              },
            ]
          : [
              {
                state: CommentState.Read,
              },
              { state: CommentState.Unread },
            ],
      },
    ]

    if (isMaster) {
      $and.push({
        $or: [
          { isWhispers: true },
          { isWhispers: false },
          {
            isWhispers: { $exists: false },
          },
        ],
      })
    } else {
      $and.push({
        $or: [
          { isWhispers: false },
          {
            isWhispers: { $exists: false },
          },
        ],
      })
    }
    const comments = await (this.commentService.model as any).paginate(
      {
        $and,
      },
      {
        limit: size,
        page,
        sort: { pin: -1, created: -1 },
        populate: {
          path: 'children',
          maxDepth: NESTED_REPLY_MAX,
        },
      },
    )

    await this.commentService.fillAndReplaceAvatarUrl(comments.docs)
    // this.commentService.cleanDirtyData(comments.docs)
    return comments
  }

  /**
   * 创建评论
   * @param params
   * @param body
   * @param isMaster
   * @param ipLocation
   * @param query
   */
  @Post('/:id')
  @HTTPDecorators.Idempotence({
    expired: 20,
    errorMessage: idempotenceMessage,
  })
  async comment(
    @Param() params: MongoIdDto,
    @Body() body: CommentDto,
    @IsMaster() isMaster: boolean,
    @IpLocation() ipLocation: IpRecord,
    @Query() query: CommentRefTypesDto,
  ) {
    //TODO: 判定是否禁用评论

    const id = params.id
    const model: Partial<CommentModel> = { ...body, ...ipLocation }
    const { ref } = query

    const comment = await this.commentService.createComment(id, model, ref)
    const commentId = comment._id.toString()
    scheduleManager.schedule(async () => {
      if (isMaster) {
        return
      }
      await this.commentService.appendIpLocation(commentId, ipLocation.ip)
    })
  }

  @Post('/reply/:id')
  @HTTPDecorators.Idempotence({
    expired: 20,
    errorMessage: idempotenceMessage,
  })
  async replyByCid(
    @Param() params: MongoIdDto,
    @Body() body: CommentDto,
    @Body('author') author: string,
    @IsMaster() isMaster: boolean,
    @IpLocation() ipLocation: IpRecord,
  ) {
    //TODO：是否允许评论

    if (!isMaster) {
      await this.commentService.validAuthorName(author)
    }

    const { id } = params

    const parent = await this.commentService.model.findById(id).populate('ref')
    if (!parent) {
      throw new CannotFindException()
    }
    const commentIndex = parent.commentsIndex

    if (parent.key && parent.key.split('#').length >= NESTED_REPLY_MAX) {
      throw new BizException(ErrorCodeEnum.CommentTooDeep)
    }

    const key = `${parent.key}#${commentIndex}`

    const model: Partial<CommentModel> = {
      parent,
      ref: (parent.ref as DocumentType<any>)._id,
      refType: parent.refType,
      ...body,
      ...ipLocation,
      key,
    }

    const comment = await this.commentService.model.create(model)
    const commentId = comment._id.toString()
    scheduleManager.schedule(async () => {
      if (isMaster) {
        return
      }
      await this.commentService.appendIpLocation(commentId, ipLocation.ip)
    })

    await parent.updateOne({
      $push: {
        children: comment._id,
      },
      $inc: {
        commentsIndex: 1,
      },
      state:
        comment.state === CommentState.Read &&
        parent.state !== CommentState.Read
          ? CommentState.Read
          : parent.state,
    })

    return this.commentService
      .fillAndReplaceAvatarUrl([comment])
      .then((docs) => docs[0])
  }

  @Post('/master/comment/:id')
  @Auth()
  @HTTPDecorators.Idempotence({
    expired: 20,
    errorMessage: idempotenceMessage,
  })
  async commentByMaster(
    @CurrentUser() user: UserModel,
    @Param() params: MongoIdDto,
    @Body() body: TextOnlyDto,
    @IpLocation() ipLocation: IpRecord,
    @Query() query: CommentRefTypesDto,
  ) {
    const { name, mail, url } = user
    const model: CommentDto = {
      author: name,
      ...body,
      mail,
      url,
      state: CommentState.Read,
    } as CommentDto
    return await this.comment(params, model as any, true, ipLocation, query)
  }

  @Post('/master/reply/:id')
  @Auth()
  @HTTPDecorators.Idempotence({
    expired: 20,
    errorMessage: idempotenceMessage,
  })
  async replyByMaster(
    @CurrentUser() user: UserModel,
    @Param() params: MongoIdDto,
    @Body() body: TextOnlyDto,
    @IpLocation() ipLocation: IpRecord,
  ) {
    const { name, mail, url } = user
    const model: CommentDto = {
      author: name,
      ...body,
      mail,
      url,
      state: CommentState.Read,
    } as CommentDto
    // @ts-ignore
    return await this.replyByCid(params, model, undefined, true, ipLocation)
  }

  /**
   * 修改评论状态
   * @param params
   * @param body
   * @returns
   */
  @Patch('/:id')
  @Auth()
  async modifyCommentState(
    @Param() params: MongoIdDto,
    @Body() body: CommentStatePatchDto,
  ) {
    const { id } = params
    const { state, pin } = body

    const updateResult = {} as any

    !isUndefined(state) && Reflect.set(updateResult, 'state', state)
    !isUndefined(pin) && Reflect.set(updateResult, 'pin', pin)

    if (pin) {
      const currentRefModel = await this.commentService.model
        .findOne({
          _id: id,
        })
        .lean()
        .populate('ref')

      const refId = (currentRefModel?.ref as any)?._id
      if (refId) {
        await this.commentService.model.updateMany(
          {
            ref: refId,
          },
          {
            pin: false,
          },
        )
      }
    }

    try {
      await this.commentService.model.updateOne(
        {
          _id: id,
        },
        updateResult,
      )

      return
    } catch {
      throw new NoContentCanBeModifiedException()
    }
  }

  @Delete('/:id')
  @Auth()
  async deleteComment(@Param('id') id: string) {
    return await this.commentService.deleteComments(id)
  }

  @Delete('/deletemany')
  @Auth()
  async deleteComments(@Body('ids') ids: string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(async (id) => {
        await this.commentService.deleteComments(id)
      })
    }
    return 'success'
  }
}

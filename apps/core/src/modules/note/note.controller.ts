import {
  Body,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { NoteService } from './note.service'
import { NoteModel } from './note.model'
import { HTTPDecorators, Paginator } from '~/common/decorators/http.decorator'
import { MongoIdDto } from '~/shared/dto/id.dto'
import { Auth } from '~/common/decorators/auth.decorator'
import { IsMaster } from '~/common/decorators/role.decorator'
import { NidType, NotePasswordQueryDto, NoteQueryDto } from './note.dto'
import { addYearCondition } from '~/transformers/db-query.transformer'
import { CannotFindException } from '~/common/exceptions/cant-find.exception'
import { ApiController } from '~/common/decorators/api-controller.decorator'

@ApiController('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post('/')
  @Auth()
  @HTTPDecorators.Idempotence()
  async create(@Body() body: NoteModel) {
    return await this.noteService.create(body)
  }

  @Put('/:id')
  @Auth()
  async update(@Param() params: MongoIdDto, @Body() body: NoteModel) {
    return await this.noteService.updateById(params.id, body)
  }

  @Delete('/:id')
  @Auth()
  async delete(@Param() params: MongoIdDto) {
    return await this.noteService.deleteById(params.id)
  }

  @Get('/')
  @Paginator
  async getNoteList(
    @IsMaster() isMaster: boolean,
    @Query() query: NoteQueryDto,
  ) {
    const { size, select, page, sortBy, sortOrder, year, db_query } = query
    const condition = { ...addYearCondition(year) }

    if (!isMaster) {
      Object.assign(condition, this.noteService.publicNoteQueryCondition)
    }

    return await (this.noteService.model as any).paginate(
      db_query ?? condition,
      {
        limit: size,
        page,
        select: isMaster
          ? select
          : select?.replace(/[+-]?(coordinates|location|password)/g, ''),
        sort: sortBy ? { [sortBy]: sortOrder || -1 } : { created: -1 },
      },
    )
  }

  @Get('/:id')
  @Auth()
  async getOneNote(@Param() params: MongoIdDto) {
    const { id } = params

    const current = await this.noteService.model
      .findOne({
        _id: id,
      })
      .select(`+password +location +coordinates`)
      .lean({ getters: true })
    if (!current) {
      throw new CannotFindException()
    }

    return current
  }

  @Get('/latest')
  async getLatestOne(@IsMaster() isMaster: boolean) {
    const result = await this.noteService.getLatestOne(
      isMaster ? {} : this.noteService.publicNoteQueryCondition,
      isMaster ? '+location +coordinates' : '-location -coordinates',
    )

    if (!result) return null
    const { latest, next } = result
    latest.text = this.noteService.checkNoteIsSecret(latest) ? '' : latest.text

    return { data: latest, next }
  }

  // C 端入口
  @Get('/nid/:nid')
  async getNoteByNid(
    @Param() params: NidType,
    @IsMaster() isMaster: boolean,
    @Query() query: NotePasswordQueryDto,
    // @IpLocation() { ip }: IpRecord,
  ) {
    const { nid } = params
    const { password, single: isSingle } = query
    const condition = isMaster ? {} : { hide: false }
    const current: NoteModel | null = await this.noteService.model
      .findOne({
        nid,
        ...condition,
      })
      .select(`+password ${isMaster ? '+location +coordinates' : ''}`)
      .lean({ getters: true, autopopulate: true })
    if (!current) {
      throw new CannotFindException()
    }
    // TODO: 文本替换
    // current.text =
    //   !isMaster && this.noteService.checkNoteIsSecret(current)
    //     ? ''
    //     : await this.macrosService.replaceTextMacro(current.text, current)

    if (
      !this.noteService.checkPasswordToAccess(current, password) &&
      !isMaster
    ) {
      throw new ForbiddenException('不要偷看人家的小心思啦~')
    }

    // TODO:点赞统计
    // const liked = await this.countingService
    //   .getThisRecordIsLiked(current.id!, ip)
    //   .catch(() => false)

    const currentData = {
      ...current,
      liked: false,
    }

    if (isSingle) {
      return currentData
    }

    const select = '_id title nid id created modified'

    const prev = await this.noteService.model
      .findOne({
        ...condition,
        created: {
          $gt: current.created,
        },
      })
      .sort({ created: 1 })
      .select(select)
      .lean()
    const next = await this.noteService.model
      .findOne({
        ...condition,
        created: {
          $lt: current.created,
        },
      })
      .sort({ created: -1 })
      .select(select)
      .lean()
    if (currentData.password) {
      currentData.password = '*'
    }
    return { data: currentData, next, prev }
  }
}

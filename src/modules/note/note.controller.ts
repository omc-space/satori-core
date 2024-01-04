import {
  Body,
  Controller,
  Delete,
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
import { NoteQueryDto } from './note.dto'
import { addYearCondition } from '~/transformers/db-query.transformer'
import { CannotFindException } from '~/common/exceptions/cant-find.exception'

@Controller('notes')
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

    return await this.noteService.model.paginate(db_query ?? condition, {
      limit: size,
      page,
      select: isMaster
        ? select
        : select?.replace(/[+-]?(coordinates|location|password)/g, ''),
      sort: sortBy ? { [sortBy]: sortOrder || -1 } : { created: -1 },
    })
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
}

import { BadRequestException, Body, Delete, Get, Query } from '@nestjs/common'
import {
  BaseCrudFactory,
  BaseCrudModuleType,
} from '~/transformers/crud-factor.transformer'
import { ImageModel } from './image.model'
import { Paginator } from '~/common/decorators/http.decorator'
import { ImageDto } from '~/modules/image/image.dto'
import { ApiController } from '~/common/decorators/api-controller.decorator'

@ApiController('images')
export class ImageController extends BaseCrudFactory({ model: ImageModel }) {
  @Get('/')
  @Paginator
  async gets(this: BaseCrudModuleType<ImageModel>, @Query() dto: ImageDto) {
    const { page, size } = dto
    const dbQuery = {
      ...dto,
    }
    if (dbQuery?.tag?.length) {
      const q = { tag: { $in: dto.tag } }
      Object.assign(dbQuery, q)
    }
    delete dbQuery.page
    delete dbQuery.size
    return await this._model.paginate(dbQuery, {
      limit: size,
      page,
      sort: { created: -1 },
    })
  }

  @Delete('/deletemany')
  deleteMany(@Body('ids') ids: string[]) {
    if (ids.length === 0) throw new BadRequestException('id不能为空')
    return this._model.deleteMany({ _id: { $in: ids } })
  }
}

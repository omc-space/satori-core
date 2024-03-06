import { BadRequestException, Body, Delete, Get, Query } from '@nestjs/common'

import { LogQueryDto } from './log.model'
import { Paginator } from '~/common/decorators/http.decorator'
import { ApiController } from '~/common/decorators/api-controller.decorator'
import { LogService } from './log.service'
import { Auth } from '~/common/decorators/auth.decorator'

@ApiController('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Auth()
  @Get('/')
  @Paginator
  async gets(@Query() dto: LogQueryDto) {
    const { page, size } = dto
    const dbQuery = {
      ...dto,
    }
    delete dbQuery.page
    delete dbQuery.size
    return await this.logService.model.paginate(dbQuery, {
      limit: size,
      page,
      sort: { created: -1 },
    })
  }

  @Auth()
  @Delete('/deletemany')
  deleteMany(@Body('ids') ids: string[]) {
    if (ids.length === 0) throw new BadRequestException('id不能为空')
    return this.logService.model.deleteMany({ _id: { $in: ids } })
  }

  @Auth()
  @Delete('/clear')
  clearLog(@Query('date') date: Date) {
    return this.logService.clearLog(date)
  }
}

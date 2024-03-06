import { Injectable } from '@nestjs/common'
import { LogModel, LogDto } from './log.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { CacheService } from '../redis/cache.service'

@Injectable()
export class LogService {
  constructor(
    @InjectModel(LogModel)
    private readonly logModel: MongooseModel<LogModel>,
    private readonly cacheService: CacheService,
  ) {}

  get model() {
    return this.logModel
  }

  async create(logModel: LogDto) {
    const key = logModel.ip + '_' + logModel.path
    const v = await this.cacheService.get(key)
    if (v) return null
    await this.cacheService.set(key, 1, 30 * 1000)
    return await this.logModel.create(logModel)
  }

  async deleteLogs(ids: string[]) {
    return await this.logModel.deleteMany({
      _id: {
        $in: ids,
      },
    })
  }

  async clearLog(date?: Date) {
    if (!date) return await this.logModel.deleteMany()

    return await this.logModel.findAndDelete({
      created: {
        $lt: date,
      },
    })
  }
}

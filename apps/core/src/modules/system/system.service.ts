import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'

import { InjectModel } from '~/common/decorators/inject.model.decorator'

import { SystemModel } from './system.model'

@Injectable()
export class SystemService {
  constructor(
    @InjectModel(SystemModel)
    private readonly systemModel: ReturnModelType<typeof SystemModel>,
  ) {
    this.initValues()
  }

  public get model() {
    return this.systemModel
  }

  async initValues() {
    const result = await this.systemModel.findOne().lean()
    if (!result)
      await this.systemModel.create({
        keys: {},
      })
  }

  async saveKey(key: string, value: any) {
    const result = await this.systemModel.findOne()
    result.keys[key] = value
    await result.updateOne({
      keys: result.keys,
    })
    return result.keys[key]
  }
}

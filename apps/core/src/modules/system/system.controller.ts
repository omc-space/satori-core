import {
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'

import { SystemModel } from './system.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { SystemService } from './system.service'

@ApiController('system')
export class SystemBaseController {
  constructor(
    @InjectModel(SystemModel)
    private readonly _model: MongooseModel<SystemModel>,
    private readonly systemService: SystemService,
  ) {}

  @Get('/keys')
  async getKeys() {
    const result = await this._model.findOne().lean()
    return result.keys
  }

  @Get('/keys/:key')
  async getKey(@Param('key') key: string) {
    const result = await this._model.findOne().lean()
    if (!result || !result.keys[key]) {
      throw new NotFoundException('不存在该key')
    }

    return result.keys[key]
  }

  @Auth()
  @Post('/keys/:key')
  async addKey(@Param('key') key: string, @Body() value: any) {
    return await this.systemService.saveKey(key, value)
  }

  @Auth()
  @Patch('/keys/:key')
  async patchKey(@Param('key') key: string, @Body() value: any) {
    const result = await this._model.findOne()
    result.keys[key] = value
    await result.save()
    return result.keys[key]
  }

  @Auth()
  @Delete('/keys/:key')
  async deleteKey(@Param('key') key: string) {
    const result = await this._model.findOne()
    if (!result.keys[key]) throw new NotFoundException('不存在该key')

    delete result.keys[key]
    await result.updateOne({
      keys: result.keys,
    })
    return null
  }

  @Get('/theme')
  async getTheme() {
    const themes = await this.systemService.getThemeColor()
    return themes
  }
}

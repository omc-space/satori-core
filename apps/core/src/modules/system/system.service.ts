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
        keys: {
          header: [
            {
              name: '首页',
              path: '/',
              iconClass: 'i-tabler:alpha',
              children: [
                {
                  name: '自述',
                  path: '/about',
                },
                {
                  name: '留言',
                  path: '/message',
                },
                {
                  name: '时间线',
                  path: '/timeline',
                },
              ],
            },
            {
              name: '文稿',
              path: '/post',
              iconClass: 'i-tabler:file-description',
              children: [],
            },
            {
              name: '手记',
              path: '/note/latest',
              iconClass: 'i-tabler:notebook',
            },
            {
              name: '速览',
              path: '/timeline',
              iconClass: 'i-tabler:list-details',
            },
            {
              name: '友链',
              path: '/friends',
              iconClass: 'i-tabler:link',
            },
            {
              name: '更多',
              iconClass: 'i-tabler:alphabet-cyrillic',
              path: '/more',
              children: [
                {
                  name: '一言',
                  path: '/more/say',
                  iconClass: 'i-tabler:music',
                },
              ],
            },
          ],
        },
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

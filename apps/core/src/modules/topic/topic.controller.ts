import slugify from 'slugify'

import { Get, Param } from '@nestjs/common'

import { CannotFindException } from '~/common/exceptions/cant-find.exception'
import { BaseCrudFactory } from '~/transformers/crud-factor.transformer'

import { TopicModel } from './topic.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'

class Upper {
  constructor(
    @InjectModel(TopicModel)
    private readonly _model: MongooseModel<TopicModel>,
  ) {}

  @Get('/slug/:slug')
  async getTopicByTopic(@Param('slug') slug: string) {
    slug = slugify(slug)
    const topic = await this._model.findOne({ slug }).lean()
    if (!topic) {
      throw new CannotFindException()
    }

    return topic
  }
}

export const TopicBaseController = BaseCrudFactory({
  model: TopicModel,

  classUpper: Upper,
})

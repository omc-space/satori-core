import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'

import { InjectModel } from '~/common/decorators/inject.model.decorator'

import { TopicModel } from './topic.model'

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(TopicModel)
    private readonly topicModel: ReturnModelType<typeof TopicModel>,
  ) {}

  public get model() {
    return this.topicModel
  }
}

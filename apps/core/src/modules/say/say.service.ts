import { Injectable } from '@nestjs/common'

import { InjectModel } from '~/common/decorators/inject.model.decorator'

import { SayModel } from './say.model'

@Injectable()
export class SayService {
  constructor(
    @InjectModel(SayModel) private readonly sayModel: MongooseModel<SayModel>,
  ) {}

  public get model() {
    return this.sayModel
  }
}

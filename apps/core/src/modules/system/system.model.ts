import { modelOptions, prop } from '@typegoose/typegoose'
import { SYSTEM_COLLECTION_NAME } from '~/constants/db.constant'
import { BaseModel } from '~/shared/model/base.model'

@modelOptions({
  options: {
    customName: SYSTEM_COLLECTION_NAME,
  },
})
export class SystemModel extends BaseModel {
  @prop({ default: {} })
  keys?: Record<string, any>
}

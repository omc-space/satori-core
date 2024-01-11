import { index, modelOptions, plugin } from '@typegoose/typegoose'
import { mongooseLeanId } from './plugins/lean-id'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Paginate = require('mongoose-paginate-v2')

@plugin(mongooseLeanId)
@plugin(Paginate)
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
    versionKey: false,
  },
})
@index({ created: -1 })
@index({ created: 1 })
export class BaseModel {
  created?: Date

  id: string

  static get protectedKeys() {
    return ['created', 'id', '_id']
  }
}

import { modelOptions } from '@typegoose/typegoose'

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
export class BaseModel {
  created?: Date

  id: string

  static get protectedKeys() {
    return ['created', 'id', '_id']
  }
}

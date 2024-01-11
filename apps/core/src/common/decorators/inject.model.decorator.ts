import { Inject } from '@nestjs/common'
import { DB_MODEL_TOKEN_SUFFIX } from '~/constants/system.constant'

export interface TypegooseClass {
  new (...args: any[])
}

export function getModelToken(modelName: string): string {
  return modelName + DB_MODEL_TOKEN_SUFFIX
}

// Model injector
export function InjectModel(model: TypegooseClass) {
  return Inject(getModelToken(model.name))
}

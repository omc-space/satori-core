/// <reference types="zx/globals" />
import type { Document } from 'mongoose'
import { PaginateModel } from 'mongoose-paginate-v2'
import type { ReturnModelType } from '@typegoose/typegoose/lib/types'

declare global {
  export type KV<T = any> = Record<string, T>

  export type MongooseModel<T> = ReturnModelType<T> &
    PaginateModel<T & Document>
}

export {}

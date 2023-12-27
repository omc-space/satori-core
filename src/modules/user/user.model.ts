import { Severity, modelOptions, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcryptjs'
import { omit } from 'lodash'
import { Schema } from 'mongoose'
import { BaseModel } from '~/shared/model/base.model'

export class TokenModel {
  _id?: string
  @prop()
  created: Date

  @prop()
  token: string

  @prop()
  expired?: Date

  @prop({ unique: true })
  name: string
}

const securityKeys = [
  'oauth2',
  'apiToken',
  'lastLoginTime',
  'lastLoginIp',
  'password',
] as const

@modelOptions({ options: { customName: 'User', allowMixed: Severity.ALLOW } })
export class UserModel extends BaseModel {
  @prop({ required: true, unique: true, trim: true })
  username!: string

  @prop({ trim: true })
  name!: string

  @prop()
  introduce?: string

  @prop()
  avatar?: string

  @prop({
    select: false,
    get(val) {
      return val
    },
    set(val) {
      return hashSync(val, 6)
    },
    required: true,
  })
  password!: string

  @prop()
  mail: string

  @prop()
  url?: string

  @prop()
  lastLoginTime?: Date

  @prop({ select: false })
  lastLoginIp?: string

  @prop({ type: Schema.Types.Mixed })
  socialIds?: any

  @prop({ type: TokenModel, select: false })
  apiToken?: TokenModel[]

  static securityKeys = securityKeys

  static serialize(doc: UserModel) {
    return omit(doc, this.securityKeys)
  }
}

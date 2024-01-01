import { Severity, modelOptions, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcryptjs'
import { IsOptional } from 'class-validator'
import { omit } from 'lodash'
import { Schema } from 'mongoose'
import { USER_COLLECTION_NAME } from '~/constants/db.constant'
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

@modelOptions({
  options: { customName: USER_COLLECTION_NAME, allowMixed: Severity.ALLOW },
})
export class UserModel extends BaseModel {
  @prop({ required: true, unique: true, trim: true })
  username!: string

  @prop({ trim: true })
  name!: string

  @prop()
  @IsOptional()
  introduce?: string

  @prop()
  @IsOptional()
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
  @IsOptional()
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

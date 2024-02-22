import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator'

import { modelOptions, prop } from '@typegoose/typegoose'

import { BaseModel } from '~/shared/model/base.model'

@modelOptions({ options: { customName: 'Image' } })
export class ImageModel extends BaseModel {
  @prop()
  @MaxLength(20, { message: '标题太长了 www' })
  @IsOptional()
  title: string

  @prop({ required: true })
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: '只有 HTTPS 被允许哦' },
  )
  url: string

  @IsOptional()
  @IsString()
  @prop({ trim: true })
  @MaxLength(50, { message: '描述信息超过 50 会坏掉的！' })
  description?: string

  @prop()
  @IsArray({ message: '标签必须是一个数组' })
  @IsOptional()
  tag?: Array<string>

  @prop()
  @IsOptional()
  path?: string

  @prop()
  @IsOptional()
  width?: number

  @prop()
  @IsOptional()
  height?: number

  @prop()
  @IsOptional()
  location?: string
}

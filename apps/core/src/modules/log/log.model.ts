import { IsOptional, IsString, MaxLength } from 'class-validator'

import { modelOptions, prop } from '@typegoose/typegoose'

import { BaseModel } from '~/shared/model/base.model'
import { PagerDto } from '~/shared/dto/pager.dto'

@modelOptions({ options: { customName: 'Log' } })
export class LogModel extends BaseModel {
  @IsOptional()
  @IsString()
  @prop({ trim: true })
  @MaxLength(50, { message: '描述信息超过 50 会坏掉的！' })
  description?: string

  @prop()
  @IsOptional()
  path?: string

  @prop()
  @IsOptional()
  method?: string

  @prop()
  @IsOptional()
  ip?: string

  @prop()
  @IsOptional()
  ua?: string
}

export class LogQueryDto extends PagerDto {
  @IsOptional()
  path?: string

  @IsOptional()
  ip?: string

  @IsOptional()
  method?: string

  @IsOptional()
  ua?: string
}

export class LogDto {
  @IsOptional()
  @IsString()
  @prop({ trim: true })
  @MaxLength(50, { message: '描述信息超过 50 会坏掉的！' })
  description?: string

  @prop()
  @IsOptional()
  path?: string

  @prop()
  @IsOptional()
  method?: string

  @prop()
  @IsOptional()
  ip?: string

  @prop()
  @IsOptional()
  ua?: string
}

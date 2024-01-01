import { prop } from '@typegoose/typegoose'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { BaseModel } from '~/shared/model/base.model'

export enum CategoryType {
  Category,
  Tag,
}

export class CategoryModel extends BaseModel {
  @prop({ unique: true, required: true })
  @IsString()
  @IsNotEmpty()
  name: string

  @prop({ default: CategoryType.Category })
  @IsEnum(CategoryType)
  @IsOptional()
  type: CategoryType

  @IsString()
  @IsOptional()
  slug?: string
}

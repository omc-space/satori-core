import { Severity, modelOptions, prop } from '@typegoose/typegoose'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { CATEGORY_COLLECTION_NAME } from '~/constants/db.constant'
import { BaseModel } from '~/shared/model/base.model'

export enum CategoryType {
  Category,
  Tag,
}
@modelOptions({
  options: { customName: CATEGORY_COLLECTION_NAME, allowMixed: Severity.ALLOW },
})
export class CategoryModel extends BaseModel {
  @prop({ unique: true, required: true })
  @IsString()
  @IsNotEmpty()
  name: string

  @prop({ default: CategoryType.Category })
  @IsEnum(CategoryType)
  @IsOptional()
  type: CategoryType

  @prop()
  @IsString()
  @IsOptional()
  slug?: string
}

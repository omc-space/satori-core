import { UnprocessableEntityException } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator'
import { uniq } from 'lodash'
import { CategoryType } from './category.model'

export class MultiCategoriesQueryDto {
  @IsOptional()
  @IsMongoId({
    each: true,
    message: '多分类查询使用逗号分隔，应为 mongoID',
  })
  @Transform(({ value: v }) => uniq(v.split(',')))
  ids?: Array<string>

  @IsOptional()
  @IsBoolean()
  @Transform((b) => Boolean(b))
  joint?: boolean

  @IsOptional()
  @Transform(({ value: v }: { value: string }) => {
    if (typeof v !== 'string') {
      throw new UnprocessableEntityException('type must be a string')
    }
    switch (v.toLowerCase()) {
      case 'category':
        return CategoryType.Category
      case 'tag':
        return CategoryType.Tag
      default:
        return Object.values(CategoryType).includes(+v)
          ? +v
          : CategoryType.Category
    }
  })
  type: CategoryType
}

import { Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { IsBooleanOrString } from '~/utils/validator/isBooleanOrString'

export class CategoryAndSlugDto {
  @IsString()
  readonly category: string

  @IsString()
  @Transform(({ value: v }) => decodeURI(v))
  readonly slug: string
}

export class SlugOrIdDto {
  @IsString()
  @IsNotEmpty()
  query?: string
}

export class MultiQueryTagAndCategoryDto {
  @IsOptional()
  @Transform(({ value: val }) => {
    if (val === '1' || val === 'true') {
      return true
    } else {
      return val
    }
  })
  @IsBooleanOrString()
  tag?: boolean | string
}

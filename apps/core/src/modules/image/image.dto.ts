import { IsArray, IsOptional } from 'class-validator'
import { PagerDto } from '~/shared/dto/pager.dto'

export class ImageDto extends PagerDto {
  @IsOptional()
  id?: string

  @IsArray({ message: '标签必须是一个数组' })
  @IsOptional()
  tag?: Array<string>

  @IsOptional()
  path?: string

  @IsOptional()
  width?: number

  @IsOptional()
  height?: number

  @IsOptional()
  location?: string
}

import { IsNotEmpty } from 'class-validator'
import { ArticleType } from '~/types'

export class CountDto {
  @IsNotEmpty()
  id: string

  @IsNotEmpty()
  type: ArticleType
}

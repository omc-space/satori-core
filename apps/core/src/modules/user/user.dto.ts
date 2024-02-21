import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'

export class UserOptionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly introduce?: string

  @IsEmail()
  @IsOptional()
  readonly mail?: string

  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @IsOptional()
  readonly url?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsOptional()
  readonly avatar?: string

  @IsOptional()
  @IsObject()
  readonly socialIds?: Record<string, any>
}

export class UserDto extends UserOptionDto {
  @IsString()
  @IsNotEmpty({ message: '用户名？' })
  readonly username: string

  @IsString()
  @IsNotEmpty({ message: '密码？' })
  readonly password: string
}

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名？' })
  readonly username: string

  @IsString()
  @IsNotEmpty({ message: '密码？' })
  readonly password: string
}

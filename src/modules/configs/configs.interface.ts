import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { JSONSchema } from 'class-validator-jsonschema'
import type {
  ClassConstructor,
  TypeHelpOptions,
  TypeOptions,
} from 'class-transformer'

import {
  AdminExtraDto,
  CommentOptionsDto,
  FeatureListDto,
  FriendLinkOptionsDto,
  MailOptionsDto,
  SeoDto,
  TextOptionsDto,
  UrlDto,
} from './configs.dto'

export const configDtoMapping = {} as Record<string, ClassConstructor<any>>
const ConfigField =
  (typeFunction: (type?: TypeHelpOptions) => Function, options?: TypeOptions) =>
  (target: any, propertyName: string): void => {
    configDtoMapping[propertyName] = typeFunction() as ClassConstructor<any>
    Type(typeFunction, options)(target, propertyName)
    ValidateNested()(target, propertyName)
  }
@JSONSchema({
  title: '设置',
  //@ts-ignore
  ps: ['* 敏感字段不显示，后端默认不返回敏感字段，显示为空'],
})
export abstract class IConfig {
  @ConfigField(() => UrlDto)
  url: Required<UrlDto>

  @ConfigField(() => SeoDto)
  seo: Required<SeoDto>

  @ConfigField(() => AdminExtraDto)
  adminExtra: Required<AdminExtraDto>

  @ConfigField(() => TextOptionsDto)
  textOptions: Required<TextOptionsDto>

  @ConfigField(() => CommentOptionsDto)
  commentOptions: Required<CommentOptionsDto>

  @ConfigField(() => FriendLinkOptionsDto)
  friendLinkOptions: Required<FriendLinkOptionsDto>

  @ConfigField(() => FeatureListDto)
  featureList: Required<FeatureListDto>

  @ConfigField(() => MailOptionsDto)
  mailOptions: Required<MailOptionsDto>
}

export type IConfigKeys = keyof IConfig

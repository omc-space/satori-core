import { omit } from 'lodash'

import { CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Get, Query } from '@nestjs/common'

import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { IsMaster } from '~/common/decorators/role.decorator'
import { CacheKeys } from '~/constants/cache.constant'

import { ConfigsService } from '../configs/configs.service'
import { NoteService } from '../note/note.service'
import { UserService } from '../user/user.service'

import {
  AggregateQueryDto,
  ReadAndLikeCountDocumentType,
  ReadAndLikeCountTypeDto,
  TimelineQueryDto,
  TopQueryDto,
} from './aggregate.dto'
import { AggregateService } from './aggregate.service'

@ApiController('aggregate')
export class AggregateController {
  constructor(
    private readonly aggregateService: AggregateService,
    private readonly configsService: ConfigsService,
    private readonly noteService: NoteService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  @CacheTTL(10 * 60)
  async aggregate(@Query() query: AggregateQueryDto) {
    const tasks = await Promise.allSettled([
      this.userService.getMaster(),
      this.aggregateService.getAllCategory(),
      this.configsService.get('url'),
      this.configsService.get('seo'),
      this.noteService.getLatestNoteId(),
    ])
    const [user, categories, pageMeta, url, seo, latestNoteId, themeConfig] =
      tasks.map((t) => {
        if (t.status === 'fulfilled') {
          return t.value
        } else {
          return null
        }
      })
    return {
      user,
      seo,
      url: omit(url, ['adminUrl']),
      categories,
      pageMeta,
      latestNoteId,
      theme: themeConfig,
    }
  }

  @Get('/top')
  async top(@Query() query: TopQueryDto, @IsMaster() isMaster: boolean) {
    const { size } = query
    return await this.aggregateService.topActivity(size, isMaster)
  }

  @Get('/timeline')
  async getTimeline(@Query() query: TimelineQueryDto) {
    const { sort = 1, type, year } = query
    return { data: await this.aggregateService.getTimeline(year, type, sort) }
  }

  @Get('/sitemap')
  @CacheKey(CacheKeys.SiteMap)
  @CacheTTL(3600)
  async getSiteMapContent() {
    return { data: await this.aggregateService.getSiteMapContent() }
  }

  @Get('/stat')
  @Auth()
  async stat() {
    const [count] = await Promise.all([this.aggregateService.getCounts()])
    return {
      ...count,
    }
  }

  @Get('/count_read_and_like')
  async getAllReadAndLikeCount(@Query() query: ReadAndLikeCountTypeDto) {
    const { type = ReadAndLikeCountDocumentType.All } = query
    return await this.aggregateService.getAllReadAndLikeCount(type)
  }

  @Get('/count_site_words')
  async getSiteWords() {
    return {
      length: await this.aggregateService.getAllSiteWordsCount(),
    }
  }
}

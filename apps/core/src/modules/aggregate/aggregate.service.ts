import { URL } from 'url'
import { pick } from 'lodash'
import type { ReturnModelType } from '@typegoose/typegoose'
import type { AnyParamConstructor } from '@typegoose/typegoose/lib/types'
import type { PipelineStage } from 'mongoose'
import type { CategoryModel } from '../category/category.model'

import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import {
  API_CACHE_PREFIX,
  CacheKeys,
  RedisKeys,
} from '~/constants/cache.constant'
import { EventBusEvents } from '~/constants/event-bus.constant'
import { CacheService } from '../redis/cache.service'
import { addYearCondition } from '~/transformers/db-query.transformer'
import { getRedisKey } from '~/utils/redis.util'
import { getShortDate } from '~/utils/time.util'

import { CategoryService } from '../category/category.service'
import { CommentState } from '../comment/comment.model'
import { CommentService } from '../comment/comment.service'
import { ConfigsService } from '../configs/configs.service'
import { LinkState } from '../link/link.model'
import { LinkService } from '../link/link.service'
import { NoteService } from '../note/note.service'
import { PostService } from '../post/post.service'
import { SayService } from '../say/say.service'
import { ReadAndLikeCountDocumentType, TimelineType } from './aggregate.dto'

@Injectable()
export class AggregateService {
  constructor(
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => NoteService))
    private readonly noteService: NoteService,

    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,

    @Inject(forwardRef(() => SayService))
    private readonly sayService: SayService,

    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
    @Inject(forwardRef(() => LinkService))
    private readonly linkService: LinkService,

    private readonly configs: ConfigsService,
    private readonly cacheService: CacheService,
  ) {}

  getAllCategory() {
    return this.categoryService.findAllCategory()
  }

  private findTop<
    U extends AnyParamConstructor<any>,
    T extends ReturnModelType<U>,
  >(model: T, condition = {}, size = 6) {
    return model
      .find(condition)
      .sort({ created: -1 })
      .limit(size)
      .select(
        '_id title name slug avatar nid created meta images tags modified',
      )
  }

  async topActivity(size = 6, isMaster = false) {
    const [notes, posts, says] = await Promise.all([
      this.findTop(
        this.noteService.model,
        !isMaster
          ? {
              hide: false,
              password: undefined,
            }
          : {},
        size,
      ).lean({ getters: true }),

      this.findTop(
        this.postService.model,
        !isMaster ? { hide: false } : {},
        size,
      )
        .populate('categoryId')
        .lean({ getters: true })
        .then((res) => {
          return res.map((post) => {
            post.category = pick(post.categoryId, ['name', 'slug'])
            delete post.categoryId
            return post
          })
        }),

      this.sayService.model.find({}).sort({ create: -1 }).limit(size),
    ])

    return { notes, posts, says }
  }

  async getTimeline(
    year: number | undefined,
    type: TimelineType | undefined,
    sortBy: 1 | -1 = 1,
  ) {
    const data: any = {}
    const getPosts = () =>
      this.postService.model
        .find({ ...addYearCondition(year) })
        .sort({ created: sortBy })
        .populate('category')

        .then((list) =>
          list.map((item) => ({
            ...pick(item, ['_id', 'title', 'slug', 'created', 'modified']),
            category: item.category,
            // summary:
            //   item.summary ??
            //   (item.text.length > 150
            //     ? item.text.slice(0, 150) + '...'
            //     : item.text),
            url: encodeURI(
              `/posts/${(item.category as CategoryModel).slug}/${item.slug}`,
            ),
          })),
        )

    const getNotes = () =>
      this.noteService.model
        .find(
          {
            hide: false,
            ...addYearCondition(year),
          },
          '_id nid title weather mood created modified hasMemory',
        )
        .sort({ created: sortBy })
        .lean()

    switch (type) {
      case TimelineType.Post: {
        data.posts = await getPosts()
        break
      }
      case TimelineType.Note: {
        data.notes = await getNotes()
        break
      }
      default: {
        const tasks = await Promise.all([getPosts(), getNotes()])
        data.posts = tasks[0]
        data.notes = tasks[1]
      }
    }

    return data
  }

  async getSiteMapContent() {
    const {
      url: { webUrl: baseURL },
    } = await this.configs.waitForConfigReady()

    const combineTasks = await Promise.all([
      this.noteService.model
        .find({
          hide: false,
          $or: [
            { password: undefined },
            { password: { $exists: false } },
            { password: null },
          ],
          secret: {
            $lte: new Date(),
          },
        })
        .lean()
        .then((list) =>
          list.map((doc) => {
            return {
              url: new URL(`/notes/${doc.nid}`, baseURL),
              published_at: doc.modified
                ? new Date(doc.modified)
                : new Date(doc.created!),
            }
          }),
        ),

      this.postService.model
        .find({
          hide: false,
        })
        .populate('category')
        .then((list) =>
          list.map((doc) => {
            return {
              url: new URL(
                `/posts/${(doc.category as CategoryModel).slug}/${doc.slug}`,
                baseURL,
              ),
              published_at: doc.modified
                ? new Date(doc.modified)
                : new Date(doc.created!),
            }
          }),
        ),
    ])

    return combineTasks
      .flat(1)
      .sort((a, b) => -(a.published_at.getTime() - b.published_at.getTime()))
  }

  async getCounts() {
    const redisClient = this.cacheService.getClient()
    const dateFormat = getShortDate(new Date())

    const [
      online,
      posts,
      notes,
      says,
      comments,
      allComments,
      unreadComments,
      links,
      linkApply,
      categories,
    ] = await Promise.all([
      this.postService.model.countDocuments(),
      this.noteService.model.countDocuments(),
      this.categoryService.model.countDocuments(),
      this.sayService.model.countDocuments(),
      this.commentService.model.countDocuments({
        parent: null,
        $or: [{ state: CommentState.Read }, { state: CommentState.Unread }],
      }),
      this.commentService.model.countDocuments({
        $or: [{ state: CommentState.Read }, { state: CommentState.Unread }],
      }),
      this.commentService.model.countDocuments({
        state: CommentState.Unread,
      }),
      this.linkService.model.countDocuments({
        state: LinkState.Pass,
      }),
      this.linkService.model.countDocuments({
        state: LinkState.Audit,
      }),
      this.categoryService.model.countDocuments({}),
    ])

    const [todayMaxOnline, todayOnlineTotal] = await Promise.all([
      redisClient.hget(getRedisKey(RedisKeys.MaxOnlineCount), dateFormat),
      redisClient.hget(
        getRedisKey(RedisKeys.MaxOnlineCount, 'total'),
        dateFormat,
      ),
    ])

    return {
      allComments,
      categories,
      comments,
      linkApply,
      links,
      notes,
      posts,
      says,
      unreadComments,
      online,
      todayMaxOnline: todayMaxOnline || 0,
      todayOnlineTotal: todayOnlineTotal || 0,
    }
  }

  @OnEvent(EventBusEvents.CleanAggregateCache, { async: true })
  public clearAggregateCache() {
    return Promise.all([
      this.cacheService.getClient().del(CacheKeys.RSS),
      this.cacheService.getClient().del(CacheKeys.RSSXml),
      this.cacheService.getClient().del(`${API_CACHE_PREFIX}/aggregate*`),
      this.cacheService.getClient().del(CacheKeys.SiteMap),
      this.cacheService.getClient().del(CacheKeys.SiteMapXml),
    ])
  }

  async getAllReadAndLikeCount(type: ReadAndLikeCountDocumentType) {
    const pipeline = [
      {
        $match: {
          count: { $exists: true }, // 筛选存在 count 字段的文档
        },
      },
      {
        $group: {
          _id: null, // 不根据特定字段分组
          totalLikes: { $sum: '$count.like' }, // 计算所有文档的 like 总和
          totalReads: { $sum: '$count.read' }, // 计算所有文档的 read 总和
        },
      },
      {
        $project: {
          _id: 0, // 不显示 _id 字段
        },
      },
    ]

    let counts = {
      totalLikes: 0,
      totalReads: 0,
    }

    switch (type) {
      case ReadAndLikeCountDocumentType.Post: {
        const result = await this.postService.model.aggregate(pipeline)
        if (result[0]) counts = result[0]

        break
      }
      case ReadAndLikeCountDocumentType.Note: {
        const result = await this.postService.model.aggregate(pipeline)
        if (result[0]) counts = result[0]
        break
      }
      case ReadAndLikeCountDocumentType.All: {
        const results = await Promise.all([
          this.getAllReadAndLikeCount(ReadAndLikeCountDocumentType.Post),
          this.getAllReadAndLikeCount(ReadAndLikeCountDocumentType.Note),
        ])

        for (const result of results) {
          counts.totalLikes += result.totalLikes
          counts.totalReads += result.totalReads
        }
      }
    }

    return counts
  }

  async getAllSiteWordsCount() {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          text: { $exists: true, $type: 'string' }, // 筛选存在且类型为字符串的 text 字段
        },
      },
      {
        $group: {
          _id: null, // 不根据特定字段分组
          totalCharacters: { $sum: { $strLenCP: '$text' } }, // 计算所有文档的 text 字符长度总和
        },
      },
      {
        $project: {
          _id: 0, // 不显示 _id 字段
        },
      },
    ]
    const results = await Promise.all([
      this.postService.model.aggregate(pipeline),
      this.noteService.model.aggregate(pipeline),
    ])

    return results.reduce((prev, curr) => {
      const [result] = curr
      if (!result) return prev
      return prev + result.totalCharacters
    }, 0)
  }
}

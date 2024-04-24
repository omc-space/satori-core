import { CacheService } from '../redis/cache.service'
import { ArticleType } from '~/types'
import { likeAndReadCacheTTL } from '~/constants/cache.constant'
import { ReturnModelType } from '@typegoose/typegoose'
import { NoteModel } from '../note/note.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { PostModel } from '../post/post.model'
import { BadRequestException, Injectable } from '@nestjs/common'

@Injectable()
export class CountService {
  constructor(
    private readonly cacheService: CacheService,
    @InjectModel(NoteModel)
    private readonly noteModel: ReturnModelType<typeof NoteModel>,
    @InjectModel(PostModel)
    private readonly postModel: ReturnModelType<typeof PostModel>,
  ) {}

  getLikeKey(id: string, type: ArticleType, ip: string) {
    return `${type}:${id}:${ip}:like`
  }

  getReadKey(id: string, type: ArticleType, ip: string) {
    return `${type}:${id}:${ip}:read`
  }

  async like(id: string, type: ArticleType, ip: string) {
    const key = this.getLikeKey(id, type, ip)
    const value = await this.cacheService.get(key)
    if (value) throw new BadRequestException('一天只能点赞一次')

    await this.cacheService.set(key, '1', likeAndReadCacheTTL)

    let model: ReturnModelType<typeof NoteModel | typeof PostModel>
    if (type === 'post') {
      model = this.postModel
    } else if (type === 'note') {
      model = this.noteModel
    }

    await model.updateOne(
      { _id: id },
      {
        $inc: {
          'count.like': 1,
        },
      },
    )

    return true
  }

  // 取消点赞
  async revocationLike(id: string, type: ArticleType, ip: string) {
    await this.cacheService.del(this.getLikeKey(id, type, ip))
    return true
  }

  async recordRead(id: string, type: ArticleType, ip: string) {
    const key = this.getReadKey(id, type, ip)
    const value = await this.cacheService.get(key)
    if (value) return
    this.cacheService.set(key, '1', likeAndReadCacheTTL)

    let model: ReturnModelType<typeof NoteModel | typeof PostModel>
    if (type === 'post') {
      model = this.postModel
    } else if (type === 'note') {
      model = this.noteModel
    }
    await model.updateOne(
      { _id: id },
      {
        $inc: {
          'count.read': 1,
        },
      },
    )
  }

  async isLiked(id: string, type: ArticleType, ip: string) {
    return !!(await this.cacheService.get(this.getLikeKey(id, type, ip)))
  }
}

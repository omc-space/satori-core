import { isDefined } from 'class-validator'
import { omit } from 'lodash'
import slugify from 'slugify'

import { Injectable } from '@nestjs/common'

import { BizException } from '~/common/exceptions/biz.exception'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'
import { BusinessEvents } from '~/constants/business-event.constant'
import { ErrorCodeEnum } from '~/constants/error-code.constant'
import { EventManagerService } from '~/shared/helper/helper.event.service'
// import { TextMacroService } from '~/processors/helper/helper.macro.service'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
// import { scheduleManager } from '~/utils'

import { PageModel } from './page.model'
import { getImageMetaFromMd } from '~/utils/pic.util'

@Injectable()
export class PageService {
  constructor(
    @InjectModel(PageModel)
    private readonly pageModel: MongooseModel<PageModel>,
    private readonly eventManager: EventManagerService,
  ) {}

  public get model() {
    return this.pageModel
  }

  public async create(doc: PageModel) {
    const count = await this.model.countDocuments({})
    if (count >= 10) {
      throw new BizException(ErrorCodeEnum.MaxCountLimit)
    }
    // `0` or `undefined` or `null`
    if (!doc.order) {
      doc.order = count + 1
    }
    doc.images = await getImageMetaFromMd(doc.text)
    const res = await this.model.create({
      ...doc,
      slug: slugify(doc.slug),
      created: new Date(),
    })

    // this.imageService(
    //   doc.text,
    //   res.images,
    //   (images) => {
    //     res.images = images
    //     return res.save().then(() => {
    //       this.eventManager.broadcast(BusinessEvents.PAGE_UPDATE, res)
    //     })
    //   },
    // )

    this.eventManager.broadcast(BusinessEvents.PAGE_CREATE, res)

    return res
  }

  public async updateById(id: string, doc: Partial<PageModel>) {
    if (['text', 'title', 'subtitle'].some((key) => isDefined(doc[key]))) {
      doc.modified = new Date()
    }
    if (doc.slug) {
      doc.slug = slugify(doc.slug)
    }

    const newDoc = await this.model
      .findOneAndUpdate(
        { _id: id },
        { ...omit(doc, PageModel.protectedKeys) },
        { new: true },
      )
      .lean({ getters: true })

    if (!newDoc) {
      throw new NoContentCanBeModifiedException()
    }
  }

  async deleteById(id: string) {
    await this.model.deleteOne({
      _id: id,
    })
    this.eventManager.broadcast(BusinessEvents.PAGE_DELETE, id)
  }
}

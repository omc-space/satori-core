import { Injectable } from '@nestjs/common'
import { NoteModel } from './note.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { getLessThanNow } from '~/utils'
// import { ReturnModelType } from '@typegoose/typegoose'
import { omit } from 'lodash'
import { isDefined, isMongoId } from 'class-validator'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'
import { ReturnModelType } from '@typegoose/typegoose'
import { FilterQuery } from 'mongoose'
import type { DocumentType } from '@typegoose/typegoose'
import dayjs from 'dayjs'

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(NoteModel)
    private readonly noteModel: ReturnModelType<typeof NoteModel>,
  ) {}

  public get model() {
    return this.noteModel
  }

  async create(document: NoteModel) {
    document.created = getLessThanNow(document.created)

    const note = await this.noteModel.create(document)

    return note
  }

  async updateById(id: string, data: Partial<NoteModel>) {
    const updatedData = Object.assign(
      {},
      omit(data, NoteModel.protectedKeys),
      data.created
        ? {
            created: getLessThanNow(data.created),
          }
        : {},
    )

    if (['title', 'text'].some((key) => isDefined(key))) {
      data.modified = new Date()
    }

    const updated = await this.noteModel
      .findByIdAndUpdate(
        {
          _id: id,
        },
        updatedData,
        {
          new: true,
          timestamps: true,
        },
      )
      .lean({
        getters: true,
        autopopulate: true,
      })

    if (!updated) {
      throw new NoContentCanBeModifiedException()
    }

    return updated
  }

  async deleteById(id: string) {
    const doc = await this.noteModel.findById(id)
    if (!doc) {
      throw new NoContentCanBeModifiedException()
    }

    await this.noteModel.deleteOne({ _id: id })
  }

  async getIdByNid(nid: number) {
    const document = await this.model
      .findOne({
        nid,
      })
      .lean()
    if (!document) {
      return null
    }
    return document._id
  }

  async findOneByIdOrNid(unique: any) {
    if (!isMongoId(unique)) {
      const id = await this.getIdByNid(unique)
      return this.model.findOne({ _id: id })
    }

    return await this.model.findById(unique)
  }

  public readonly publicNoteQueryCondition = {
    hide: false,
    $and: [
      {
        $or: [
          {
            password: '',
          },
          {
            password: undefined,
          },
        ],
      },
      {
        $or: [
          {
            secret: undefined,
          },
          {
            secret: {
              $lt: new Date(),
            },
          },
        ],
      },
    ],
  }

  async getLatestOne(
    condition: FilterQuery<DocumentType<NoteModel>> = {},
    projection: any = undefined,
  ) {
    const latest: NoteModel | null = await this.noteModel
      .findOne(condition, projection)
      .sort({
        created: -1,
      })
      .lean({
        getters: true,
        autopopulate: true,
      })

    if (!latest) {
      return null
    }

    const next = await this.noteModel
      .findOne({
        created: {
          $lt: latest.created,
        },
      })
      .sort({
        created: -1,
      })
      .select('nid _id')
      .lean()

    return {
      latest,
      next,
    }
  }

  public checkNoteIsSecret(note: NoteModel) {
    if (!note.secret) {
      return false
    }

    const isSecret = dayjs(note.secret).isAfter(new Date())

    return isSecret
  }

  checkPasswordToAccess<T extends NoteModel>(
    doc: T,
    password?: string,
  ): boolean {
    const hasPassword = doc.password
    if (!hasPassword) {
      return true
    }
    if (!password) {
      return false
    }
    const isValid = Object.is(password, doc.password)
    return isValid
  }
}

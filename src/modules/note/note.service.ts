import { Injectable } from '@nestjs/common'
import { NoteModel } from './note.model'
import { InjectModel } from '~/common/decorators/inject.model.decorator'
import { getLessThanNow } from '~/utils'
// import { ReturnModelType } from '@typegoose/typegoose'
import { omit } from 'lodash'
import { isDefined, isMongoId } from 'class-validator'
import { NoContentCanBeModifiedException } from '~/common/exceptions/no-content-canbe-modified.exception'

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(NoteModel)
    private readonly noteModel: MongooseModel<NoteModel>,
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

    this.noteModel.deleteOne({ _id: id })
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

    return this.model.findById(unique)
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
}

import { Controller, Get, Query } from '@nestjs/common'
import { PostService } from './post.service'
import { PipelineStage } from 'mongoose'
import { PostModel } from './post.model'
import { Paginator } from '~/common/decorators/http.decorator'
import { PagerDto } from '~/shared/dto/pager.dto'
import { addYearCondition } from '~/transformers/db-query.transformer'

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  @Paginator
  async getPaginate(@Query() query: PagerDto) {
    const { size, select, page, year, sortBy, sortOrder } = query

    return this.postService.model
      .aggregatePaginate(
        this.postService.model.aggregate(
          [
            {
              $match: {
                ...addYearCondition(year),
              },
            },
            // @see https://stackoverflow.com/questions/54810712/mongodb-sort-by-field-a-if-field-b-null-otherwise-sort-by-field-c
            {
              $addFields: {
                sortField: {
                  // create a new field called "sortField"
                  $cond: {
                    // and assign a value that depends on
                    if: { $ne: ['$pin', null] }, // whether "b" is not null
                    then: '$pinOrder', // in which case our field shall hold the value of "a"
                    else: '$$REMOVE',
                  },
                },
              },
            },
            {
              $sort: sortBy
                ? {
                    [sortBy]: sortOrder as any,
                  }
                : {
                    sortField: -1, // sort by our computed field
                    pin: -1,
                    created: -1, // and then by the "created" field
                  },
            },
            {
              $project: {
                sortField: 0, // remove "sort" field if needed
              },
            },
            select && {
              $project: {
                ...(select?.split(' ').reduce(
                  (acc, cur) => {
                    const field = cur.trim()
                    acc[field] = 1
                    return acc
                  },
                  Object.keys(new PostModel()).map((k) => ({ [k]: 0 })),
                ) as any),
              },
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true,
              },
            },
          ].filter(Boolean) as PipelineStage[],
        ),
        {
          limit: size,
          page,
        },
      )
      .then((res) => {
        res.docs = res.docs.map((doc: PostModel) => {
          if (doc.meta && typeof doc.meta === 'string') {
            doc.meta = JSON.safeParse(doc.meta as string) || doc.meta
          }
          return doc
        })
        return res
      })
  }
}

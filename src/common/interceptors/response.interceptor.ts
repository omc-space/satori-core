import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { ApiProperty } from '@nestjs/swagger'
import { FastifyReply, FastifyRequest } from 'fastify'

export interface Response<T> {
  data: T
}

export class ApiResponse<T> {
  @ApiProperty()
  data: T
  @ApiProperty({ example: 200 })
  code: number

  @ApiProperty()
  timestamp: Date

  @ApiProperty({ example: 'success' })
  message?: string

  constructor(data: T, code: number, message?: string) {
    this.data = data
    this.code = code
    this.timestamp = new Date()
    this.message = message
  }
}

export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    if (!request) {
      return next.handle()
    }
    //TODO: 跳过处理
    // if (bypass) {
    //   return next.handle()
    // }
    // const handler = context.getHandler().
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse<FastifyReply>()
        if (typeof data === 'undefined') {
          response.status(204)
          return data
        }
        // 分页转换
        // if (this.reflector.get(HTTP_RES_TRANSFORM_PAGINATE, handler)) {
        //   return transformDataToPaginate(data)
        // }

        // return isArrayLike(data) ? { data } : data
        return new ApiResponse(data, response.statusCode, 'success')
      }),
    )
  }
}

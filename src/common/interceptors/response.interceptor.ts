import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'

export interface Response<T> {
  data: T
}

import { ApiProperty } from '@nestjs/swagger'

export class ApiResponse<T> {
  @ApiProperty()
  data: T
  @ApiProperty({ example: 200 })
  code: number

  @ApiProperty()
  timestamp: Date

  @ApiProperty({ example: 'success' })
  message?: string

  constructor(data: T, code: number, timestamp: Date, message?: string) {
    this.data = data
    this.code = code
    this.timestamp = timestamp
    this.message = message
  }
}

export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    if (!context.switchToHttp().getRequest()) {
      return next.handle()
    }
    //TODO: 跳过处理
    // if (bypass) {
    //   return next.handle()
    // }
    // const handler = context.getHandler()
    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'undefined') {
          context.switchToHttp().getResponse().status(204)
          return data
        }
        // 分页转换
        // if (this.reflector.get(HTTP_RES_TRANSFORM_PAGINATE, handler)) {
        //   return transformDataToPaginate(data)
        // }

        // return isArrayLike(data) ? { data } : data
        return new ApiResponse(data, 200, new Date(), 'success')
      }),
    )
  }
}

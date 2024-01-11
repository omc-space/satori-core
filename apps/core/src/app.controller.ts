import { Get } from '@nestjs/common'
import { ApiController } from './common/decorators/api-controller.decorator'

@ApiController()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'runing'
  }
}

import { ApiController } from '~/common/decorators/api-controller.decorator'
import { IpLocation, IpRecord } from '~/common/decorators/ip.decorator'
import { CountService } from './count.service'
import { CountDto } from './count.dto'
import { Body, Post } from '@nestjs/common'

@ApiController('count')
export class CountController {
  constructor(private readonly countService: CountService) {}

  @Post('/like')
  async like(@Body() dto: CountDto, @IpLocation() { ip }: IpRecord) {
    return await this.countService.like(dto.id, dto.type, ip)
  }
}

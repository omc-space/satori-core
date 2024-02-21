import { Module } from '@nestjs/common'

import { LinkController, LinkControllerCrud } from './link.controller'
import { LinkService } from './link.service'

@Module({
  controllers: [LinkController, LinkControllerCrud],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}

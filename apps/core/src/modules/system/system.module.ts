import { Module } from '@nestjs/common'

import { SystemBaseController } from './system.controller'
import { SystemService } from './system.service'

@Module({
  controllers: [SystemBaseController],
  exports: [SystemService],
  providers: [SystemService],
})
export class SystemModule {}

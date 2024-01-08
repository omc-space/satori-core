import { Module } from '@nestjs/common'
import { ConfigsService } from './configs.service'
import { ConfigController } from './configs.controller'

@Module({
  controllers: [ConfigController],
  providers: [ConfigsService],
})
export class ConfigsModule {}

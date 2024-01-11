import { Module } from '@nestjs/common'

import { BaseOptionController } from './controllers/base.option.controller'
import { EmailOptionController } from './controllers/email.option.controller'

@Module({
  controllers: [BaseOptionController, EmailOptionController],
})
export class OptionModule {}

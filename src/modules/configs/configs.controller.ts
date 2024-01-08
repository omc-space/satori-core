import { Controller } from '@nestjs/common'
import { ConfigsService } from './configs.service'

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigsService) {}
}

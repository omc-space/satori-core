import { Get, Query } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiController } from '~/common/decorators/api-controller.decorator'

@ApiController('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify')
  async verifyToken(@Query('token') clientToken: string) {
    return await this.authService.verifyToken(clientToken)
  }
}

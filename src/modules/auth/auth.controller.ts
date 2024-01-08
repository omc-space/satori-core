import { Get, Post, Query } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiController } from '~/common/decorators/api-controller.decorator'

@ApiController('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  async getToken() {
    return await this.authService.generateToken({
      id: 'test',
      username: 'test',
    })
  }

  @Post('token')
  async postToken() {}

  @Get('verify')
  async verifyToken(@Query('token') clientToken: string) {
    return await this.authService.verifyToken(clientToken)
  }
}

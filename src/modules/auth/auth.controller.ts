import { Controller, Get, Post, Query } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  async getToken() {
    return await this.authService.generateToken({ username: 'aaa' })
  }

  @Post('token')
  async postToken() {}

  @Get('verify')
  async verifyToken(@Query('token') clientToken: string) {
    return await this.authService.verifyToken(clientToken)
  }
}

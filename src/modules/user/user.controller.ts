import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { UserService } from './user.service'
import { UserDto } from './user.dto'

import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('user')
@ApiTags('用户模块')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建master账户' })
  async createMaster(@Body() userDto: UserDto) {
    return await this.userService.createMater(userDto)
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @HttpCode(200)
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return await this.userService.login(username, password)
  }
}

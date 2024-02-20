import { Body, Get, HttpCode, Post } from '@nestjs/common'
import { UserService } from './user.service'
import { LoginDto, UserDto } from './user.dto'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from '../auth/auth.service'
import { IpLocation } from '~/common/decorators/ip.decorator'
import { ApiController } from '~/common/decorators/api-controller.decorator'

@ApiController(['user', 'master'])
@ApiTags('用户模块')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建master账户' })
  async createMaster(@Body() userDto: UserDto) {
    return await this.userService.createMater(userDto)
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @IpLocation() ipLocation) {
    const user = await this.userService.login(dto.username, dto.password)
    const { name, username, created, url, mail, avatar, id } = user
    const footstep = await this.userService.recordFootstep(id)
    return {
      token: await this.authService.generateToken({
        id: id,
        ip: ipLocation.ip,
        ua: ipLocation.agent,
      }),
      ...footstep,
      name,
      username,
      created,
      url,
      mail,
      avatar,
      id,
    }
  }

  @Get('/')
  async masterInfo() {
    return await this.userService.getMasterInfo()
  }
}

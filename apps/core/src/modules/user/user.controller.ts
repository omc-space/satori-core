import { Body, Get, HttpCode, Patch, Post, Put } from '@nestjs/common'
import { UserService } from './user.service'
import { LoginDto, UserDto, UserOptionDto } from './user.dto'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from '../auth/auth.service'
import { IpLocation } from '~/common/decorators/ip.decorator'
import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { IsMaster } from '~/common/decorators/role.decorator'

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
    const footstep = await this.userService.recordFootstep(ipLocation.ip)
    return {
      token: await this.authService.generateToken({
        ...user,
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
  async masterInfo(@IsMaster() isMaster: boolean) {
    const master = await this.userService.getMasterInfo(isMaster)
    return {
      ...master,
      isMaster,
    }
  }

  @Put('/')
  @Auth()
  async updateMasterInfo(
    @IsMaster() isMaster: boolean,
    @Body() userDto: UserOptionDto,
  ) {
    return await this.userService.updateMaster(isMaster, userDto)
  }

  @Patch('/')
  @Auth()
  async changePassword(
    @IsMaster() isMaster: boolean,
    @Body('password') password: string,
  ) {
    return await this.userService.changePassword(isMaster, password)
  }
}

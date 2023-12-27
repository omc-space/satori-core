import { BadRequestException, HttpCode, Injectable } from '@nestjs/common'
import { UserDto } from './user.dto'
import { Inject } from '@nestjs/common'
import { UserModel } from './user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { sleep } from '~/utils/tools.util'
import { compareSync } from 'bcryptjs'

@Injectable()
export class UserService {
  constructor(
    @Inject(UserModel.name)
    private readonly userModel: ReturnModelType<typeof UserModel>,
  ) {}

  async createMater(userDto: UserDto) {
    const hasMaster = await this.hasMaster()
    if (hasMaster) {
      throw new BadRequestException('我已经有一个主人了哦')
    }
    const res = await this.userModel.create({ ...userDto })
    return {
      token: 'token',
      username: res.username,
      name: res.name,
    }
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username }).select('+password')
    if (!user) {
      await sleep(3000)
      throw new BadRequestException('用户名不正确')
    }
    if (!compareSync(password, user.password)) {
      await sleep(3000)
      throw new BadRequestException('密码不正确')
    }
    delete user.password
    return user
  }

  @HttpCode(200)
  async getMasterInfo() {
    return await this.userModel.findOne()
  }

  async hasMaster() {
    return !!(await this.userModel.countDocuments())
  }
}

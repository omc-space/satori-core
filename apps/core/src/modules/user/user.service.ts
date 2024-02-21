import { BadRequestException, Injectable } from '@nestjs/common'
import { UserDto, UserOptionDto } from './user.dto'
import { UserModel as User } from './user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { sleep } from '~/utils/tools.util'
import { compareSync } from 'bcryptjs'
import { AuthService } from '../auth/auth.service'
import { InjectModel } from '~/common/decorators/inject.model.decorator'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: ReturnModelType<typeof User>,
    private readonly authService: AuthService,
  ) {}

  public get model() {
    return this.userModel
  }

  async createMater(userDto: UserDto) {
    const hasMaster = await this.hasMaster()
    if (hasMaster) {
      throw new BadRequestException('我已经有一个主人了哦')
    }
    const res = await this.userModel.create({ ...userDto })
    return {
      token: await this.authService.generateToken({ id: res.id }),
      username: res.username,
      name: res.name,
    }
  }

  async login(username: string, password: string) {
    const user = await this.userModel
      .findOne({ username })
      .select('+password')
      .lean()
    if (!user) {
      await sleep(3000)
      throw new BadRequestException('用户名不正确')
    }
    if (!compareSync(password, user.password)) {
      await sleep(3000)
      throw new BadRequestException('密码不正确')
    }
    return user
  }

  async getMasterInfo() {
    const master = await this.userModel.findOne().lean()
    if (!master) {
      throw new BadRequestException('还没有主人呢')
    }
    return master
  }

  async hasMaster() {
    return !!(await this.userModel.countDocuments())
  }

  /**
   * 记录登录足迹
   * @param ip ip地址
   * @returns 上次登录的足迹
   */
  async recordFootstep(ip: string) {
    const master = await this.userModel.findOne()
    const prevFootstep = {
      lastLoginTime: master.lastLoginTime,
      lastLoginIp: master.lastLoginIp,
    }
    await master.updateOne({
      lastLoginTime: new Date(),
      lastLoginIp: ip,
    })

    return prevFootstep
  }

  async getMaster() {
    return await this.userModel.findOne().lean()
  }

  async updateMaster(isMaster: boolean, masterOption: UserOptionDto) {
    if (!isMaster) throw new BadRequestException('您不是主人')
    return await this.userModel.findOneAndUpdate(masterOption)
  }

  async changePassword(isMaster: boolean, password: string) {
    if (!isMaster) throw new BadRequestException('您不是主人')
    return await this.userModel.findOneAndUpdate({ password })
  }
}

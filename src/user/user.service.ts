import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { Inject } from '@nestjs/common'
import { User } from './user.model'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export class UserService {
  constructor(
    @Inject(User.name)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {}

  async createMater(createUserDto: CreateUserDto) {
    const user = this.userModel.findOne()
    console.log(user)
    return user
  }
}

import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'

@Injectable()
export class PostService {
  constructor(private readonly userService: UserService) {}
}
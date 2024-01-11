import type { CanActivate, ExecutionContext } from '@nestjs/common'

import { Injectable } from '@nestjs/common'

import { AuthService } from '~/modules/auth/auth.service'
import { UserService } from '~/modules/user/user.service'
import { getNestExecutionContextRequest } from '~/transformers/get-req.transformer'

import { AuthGuard } from './auth.guard'

/**
 * 区分游客和主人的守卫
 */

@Injectable()
export class RolesGuard extends AuthGuard implements CanActivate {
  constructor(
    protected readonly authService: AuthService,

    protected readonly userService: UserService,
  ) {
    super(authService)
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context)
    let isMaster = false
    try {
      await super.canActivate(context)
      isMaster = true
      // eslint-disable-next-line no-empty
    } catch {}

    request.isGuest = !isMaster
    request.isMaster = isMaster

    Object.assign(request.raw, {
      isGuest: !isMaster,
      isMaster,
    })

    return true
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context)
  }
}

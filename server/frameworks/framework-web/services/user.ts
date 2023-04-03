import { Injectable, ScopeEnum } from '@artus/core'
import { promiseDelay } from '@sling/artus-web-shared/utils/promise'
import { ARTUS_FRAMEWORK_WEB_USER_SERVICE, Roles, UserSession } from '../types'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_USER_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export default class UserService {
  async session () {
    // Delay 300ms.
    await promiseDelay(300)

    return {
      name: 'Sling',
      roles: [Roles.SUPER_ADMIN, Roles.ANONYMOUS],
      loggedIn: true
    } as UserSession
  }
}

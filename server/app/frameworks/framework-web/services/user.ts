import { Injectable, ScopeEnum } from '@artus/core'
import { utils } from '@sling/artus-web-shared'
import { ARTUS_FRAMEWORK_WEB_USER_SERVICE, Roles, UserSession } from '../types'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_USER_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export default class UserService {
  async session () {
    // Delay 300ms.
    await utils.promiseDelay(300)

    return {
      name: 'Sling',
      roles: [ Roles.ANONYMOUS],
      loggedIn: true
    } as UserSession
  }
}

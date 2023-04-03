import { Roles } from './roles'

export const ARTUS_FRAMEWORK_WEB_CLIENT = 'ARTUS_FRAMEWORK_WEB_CLIENT'
export const ARTUS_FRAMEWORK_WEB_USER_SERVICE = 'ARTUS_FRAMEWORK_WEB_USER_SERVICE'

export interface UserSession {
  name: string,
  roles: Array<Roles>,
  loggedIn: boolean
}

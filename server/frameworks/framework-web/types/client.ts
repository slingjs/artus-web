import { Roles } from './roles'

export const ARTUS_FRAMEWORK_WEB_CLIENT = 'ARTUS_FRAMEWORK_WEB_CLIENT'
export const ARTUS_FRAMEWORK_WEB_USER_SERVICE = 'ARTUS_FRAMEWORK_WEB_USER_SERVICE'
export const ARTUS_FRAMEWORK_WEB_FILE_SERVICE = 'ARTUS_FRAMEWORK_WEB_FILE_SERVICE'
export const ARTUS_FRAMEWORK_WEB_APP_SERVICE = 'ARTUS_FRAMEWORK_WEB_APP_SERVICE'

export interface UserSession {
  name: string,
  roles: Array<Roles>,
  loggedIn: boolean
}

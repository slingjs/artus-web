import { ARTUS_FRAMEWORK_WEB_USER_NAMESPACE, ARTUS_FRAMEWORK_WEB_USER_SERVICE, UserSession } from '../../types'
import UserService from '../../services/user'
import { HTTPMiddlewareContext } from '../../../../plugins/plugin-http/types'

export async function getSession (ctx: HTTPMiddlewareContext) {
  const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)

  return storage.get('session') as UserSession
}

export async function setSession (ctx: HTTPMiddlewareContext) {
  const { input: { params: { app } } } = ctx
  const userService = app
    .container
    .get(ARTUS_FRAMEWORK_WEB_USER_SERVICE) as UserService
  const session = await userService.session()

  const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
  storage.set(session, 'session')

  return storage
}

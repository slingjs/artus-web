import { ARTUS_FRAMEWORK_WEB_USER_NAMESPACE, ARTUS_FRAMEWORK_WEB_USER_SERVICE, UserSession } from '../../types'
import { Context } from '@artus/pipeline'
import { ARTUS_WEB_APP } from '../../../../types'
import { ArtusApplication } from '@artus/core'
import UserService from '../../services/user'

export async function getSession (ctx: Context) {
  const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)

  return storage.get('session') as UserSession
}

export async function setSession (ctx: Context) {
  const userService = (ctx.namespace(ARTUS_WEB_APP).get('app') as ArtusApplication)
    .container
    .get(ARTUS_FRAMEWORK_WEB_USER_SERVICE) as UserService
  const session = await userService.session()

  const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
  storage.set(session, 'session')

  return storage
}

import { MiddlewareGenerator } from '../../../../types'
import { Roles } from '../../types'
import { getSession, setSession } from '../../utils/business/user'

export const initUser: MiddlewareGenerator = () => {
  return async function initUser (ctx, next) {
    await setSession(ctx)

    await next()
  }
}

export const userAuthMiddleware: MiddlewareGenerator = (roles?: Roles[]) => {
  return async function userAuthMiddleware (ctx, next) {
    const session = await getSession(ctx)

    if (!session.loggedIn) {
      ctx.output.data.status = 401

      return
    }

    if (!(Array.isArray(session.roles) && session.roles.length && Array.isArray(roles))) {
      await next()
      return
    }

    if (!roles.every(r => session.roles.some(sR => sR.toUpperCase() === r.toUpperCase()))) {
      ctx.output.data.status = 401

      return
    }

    await next()
  }
}

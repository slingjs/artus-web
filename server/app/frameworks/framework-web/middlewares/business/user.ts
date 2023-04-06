import { ARTUS_FRAMEWORK_WEB_USER_SERVICE, Roles } from '../../types'
import { UserService } from '../../services/user'
import cookie from 'cookie'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'
import { HTTPMiddleware } from '../../../../plugins/plugin-http/types'

export const initUser = (): HTTPMiddleware => {
  return async function initUser (ctx, next) {
    const { input: { params: { app, req, res } } } = ctx

    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const userService = app
      .container
      .get(ARTUS_FRAMEWORK_WEB_USER_SERVICE) as UserService

    const initNewSession = async function initNewSession () {
      const newSession = await userService.initSession(ctx)
      await userService.setDistributeSession(
        ctx,
        newSession.id,
        newSession
      )
      await userService.setCtxSession(ctx, newSession)
      res.setHeader(
        'set-cookie',
        cookie.serialize(shared.constants.USER_SESSION_KEY, newSession.id)
      )
    }

    if (!sessionCookieValue) {
      await initNewSession()

      return await next()
    }

    const sessionString = await userService.getDistributeSession(ctx, sessionCookieValue)
    if (!sessionString) {
      await initNewSession()

      return await next()
    }

    try {
      const session = JSON.parse(sessionString)
      await userService.setCtxSession(ctx, session)
    } catch (e) {
      await initNewSession()

      return await next()
    }

    await next()
  }
}

export const userAuthMiddleware = (roles?: Roles[]): HTTPMiddleware => {
  return async function userAuthMiddleware (ctx, next) {
    const { input: { params: { app } } } = ctx
    const userService = app
      .container
      .get(ARTUS_FRAMEWORK_WEB_USER_SERVICE) as UserService

    const session = await userService.getCtxSession(ctx)
    if (!(session && session.loggedIn)) {
      ctx.output.data.status = 401

      return
    }

    if (!(Array.isArray(session.roles) && session.roles.length && Array.isArray(roles))) {
      await next()
      return
    }

    if (!roles.every(r => session.roles.some(sR => shared.utils.compareIgnoreCase(sR, r)))) {
      ctx.output.data.status = 401

      return
    }

    await next()
  }
}

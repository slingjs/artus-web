import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE } from '../../types'
import { AccountService } from '../../services/account'
import cookie from 'cookie'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'
import { HTTPMiddleware, HTTPMiddlewareContext } from '../../../../plugins/plugin-http/types'
import { USER_SESSION_COOKIE_MAX_AGE } from '../../constants'
import { Roles } from '@sling/artus-web-shared/types'
import status from 'http-status'

export const initUser = (
  options?: Partial<{
    bypassFilter: (ctx: HTTPMiddlewareContext) => boolean
  }>
): HTTPMiddleware => {
  return async function initUser (ctx, next) {
    const { input: { params: { app, req, res } } } = ctx

    const bypassFilter = _.get(options, 'bypassFilter')
    if (typeof bypassFilter === 'function' && await bypassFilter(ctx)) {
      return await next()
    }

    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const userService = app
      .container
      .get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService

    const initNewSession = async function initNewSession (sessionCookieValue?: string) {
      const newSession = await userService.initSession(ctx, undefined, { _sessionId: sessionCookieValue })
      await userService.setDistributeSession(
        ctx,
        newSession._sessionId,
        newSession
      )
      await userService.setCtxSession(ctx, newSession)
      res.setHeader(
        'set-cookie',
        cookie.serialize(
          shared.constants.USER_SESSION_KEY,
          newSession._sessionId,
          {
            path: '/', // Must set this. Otherwise, it will be req.path as default.
            maxAge: USER_SESSION_COOKIE_MAX_AGE
          }
        )
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
      .get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService

    const session = await userService.getCtxSession(ctx)
    if (!(session && session.signedIn)) {
      ctx.output.data.status = status.UNAUTHORIZED

      return
    }

    if (!(Array.isArray(session.roles) && session.roles.length && Array.isArray(roles))) {
      await next()
      return
    }

    if (!roles.every(r => session.roles.some(sR => shared.utils.compareIgnoreCase(sR, r)))) {
      ctx.output.data.status = status.UNAUTHORIZED

      return
    }

    await next()
  }
}

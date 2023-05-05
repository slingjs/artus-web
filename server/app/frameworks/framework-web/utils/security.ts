import crypto from 'crypto'
import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'

export function encryptCsrfToken(base: string, salt: string) {
  const hash = crypto.createHash('MD5', {
    encoding: 'utf-8'
  })

  return hash.update([base, '__', salt].join('')).digest('hex')
}

export function getCsrfToken(ctx: HTTPMiddlewareContext) {
  return _.get(
    ctx.input.params.req.headers,
    shared.constants.USER_CSRF_TOKEN_KEY.toLowerCase()
  ) as string
}

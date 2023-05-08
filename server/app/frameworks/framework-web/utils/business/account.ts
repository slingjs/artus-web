import crypto from 'crypto'
import _ from 'lodash'
import { HTTPMiddlewareContext } from '../../../../plugins/plugin-http/types'

export function encryptPassword(password: string, salt: string) {
  const hash = crypto.createHash('SHA256', {
    encoding: 'utf-8'
  })

  return hash
    .update(
      [
        // Password, base64 decode.
        password,
        '__',
        salt
      ].join('')
    )
    .digest('hex')
}

export function rectifyPassword(password: string, options?: Partial<{ preEncrypt: boolean }>) {
  return _.get(options, 'preEncrypt')
    ? // Base64 decrypt.
      Buffer.from(password, 'base64').toString()
    : password
}

export function bypassInitUserMiddlewareFilter(ctx: HTTPMiddlewareContext) {
  const {
    input: {
      params: { req }
    }
  } = ctx

  return typeof req.url === 'string' && req.url.toLowerCase().includes('/sign-out'.toLowerCase())
}

import crypto from 'crypto'
import { HTTPMiddlewareContext } from '../plugins/plugin-http/types'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'
import { judgeCtxIsFromHTTP } from './middlewares'
import { WebsocketMiddlewareContext } from '../plugins/plugin-websocket/types'
import { multipleWsSubProtocolSplitter } from '../constants'

export function encryptCsrfToken(base: string, salt: string) {
  const hash = crypto.createHash('MD5', {
    encoding: 'utf-8'
  })

  return hash.update([base, '__', salt].join('')).digest('hex')
}

export function getCsrfToken(ctx: HTTPMiddlewareContext | WebsocketMiddlewareContext) {
  const isCtxFromHTTP = judgeCtxIsFromHTTP(ctx)
  const token = _.get(ctx.input.params.req.headers, shared.constants.USER_CSRF_TOKEN_KEY.toLowerCase()) as string
  if (isCtxFromHTTP) {
    return token
  }

  // Websocket node.js client requests may contain this req header.
  if (token) {
    return token
  }

  const {
    input: {
      params: { req }
    }
  } = ctx

  // CSRF stored into sub protocol
  const wsCustomSubProtocol = req.headers['sec-websocket-protocol']
  if (wsCustomSubProtocol) {
    const symbol = shared.constants.USER_CSRF_TOKEN_KEY + shared.constants.WEBSOCKET_SUB_PROTOCOL_LINKER
    const csrfSnippets = wsCustomSubProtocol.split(multipleWsSubProtocolSplitter).find(v => v.startsWith(symbol))

    if (csrfSnippets) {
      return csrfSnippets.replace(symbol, '')
    }
  }

  return ''
}

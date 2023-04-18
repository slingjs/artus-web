import shared from '@sling/artus-web-shared'
import * as urls from '../wss/urls'
import type { WsHandler, WsSocketPaths } from '@/types'
import { formatWebsocketUrlWithFragment } from '@/utils/urls'

export function wsCommunicateAccountObserve() {
  const ws = new WebSocket(formatWebsocketUrlWithFragment(urls.account.observe))
  const { p, resolve, reject } = shared.utils.generateOperablePromise<WsHandler>()

  ws.onerror = reject

  ws.onopen = resolve.bind(p, {
    path: urls.account.observe,
    ws,
    handlerPath: 'account.observe' as WsSocketPaths
  })

  return p
}

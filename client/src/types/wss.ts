import type * as urls from '../wss/urls'
import type { NestedKeyOf } from '@sling/artus-web-shared/types'

export type WsSocketPaths = Exclude<NestedKeyOf<typeof urls>, 'account'>

export type WsHandler = {
  ws: WebSocket,
  path: string,
  handlerPath: WsSocketPaths
}

export type WsHandlers = Record<WsSocketPaths, WsHandler>

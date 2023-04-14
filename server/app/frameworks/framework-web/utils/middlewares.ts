import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'
import _ from 'lodash'
import { WebsocketMiddlewareContext } from '../../../plugins/plugin-websocket/types'

export const judgeCtxIsFromHTTP = (ctx: HTTPMiddlewareContext | WebsocketMiddlewareContext): ctx is HTTPMiddlewareContext => {
  return _.has(ctx, 'input.params.res') && _.has(ctx, 'output.data.body')
}

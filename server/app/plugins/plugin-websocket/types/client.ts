import { ArtusApplication } from '@artus/core'
import { BaseContext, BaseInput, BaseOutput, Middleware } from '@artus/pipeline'
import { IncomingMessage } from 'http'
import ws from 'ws'
import { WebsocketEventDecoratorOptions, WebsocketEventMetadata, WebsocketEventMiddlewaresMetadata } from './decorator'
import { WebsocketTrigger } from '../trigger'

export const ARTUS_PLUGIN_WEBSOCKET_CLIENT = 'ARTUS_PLUGIN_WEBSOCKET_CLIENT'

export const ARTUS_PLUGIN_WEBSOCKET_TRIGGER = 'ARTUS_PLUGIN_WEBSOCKET_TRIGGER'

export const WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY = Symbol.for('websocket#request#urlObj')

export const WEBSOCKET_SOCKET_REQUEST_USER_SESSION_KEY = Symbol.for('websocket#request#userSessionKey')

export enum WebSocketEventNames {
  CONNECTION = 'connection',
  MESSAGE = 'message',
  PING = 'ping',
  PONG = 'pong',
  UNEXPECTED_RESPONSE = 'unexpected-response',
  OPEN = 'open',
  UPGRADE = 'upgrade',
  ERROR = 'error',
  CLOSE = 'close'
}

export interface WebsocketConfig {
  host: string
  port: number
  useSharedHTTPServer: boolean
  requestPathCaseSensitive: boolean
}

export type WebsocketHandlerArgumentsRecord = {
  app: ArtusApplication,
  req: IncomingMessage,
  socket: ws.WebSocket,
  socketServer: ws.WebSocketServer,
  eventArgs: any[],
  trigger: WebsocketTrigger,
  eventName: WebsocketEventMetadata['eventName']
}

export type WebsocketEventResponseBody = undefined | string | object

export type WebsocketHandlerOutputData = {
  lastMessage: WebsocketEventResponseBody
  status: number | undefined
}

export interface WebsocketMiddlewareContext extends Required<BaseContext> {
  input: Required<BaseInput<WebsocketHandlerArgumentsRecord>>
  output: Required<BaseOutput<WebsocketHandlerOutputData>>
}

export type WebsocketMiddleware = Middleware<WebsocketMiddlewareContext>

export type WebsocketEventRuleItemData = {
  event: WebsocketEventMetadata['eventName']
  metadata: Array<{
    handler: WebsocketMiddleware,
    options: WebsocketEventMetadata['options'],
    middlewares: WebsocketEventMiddlewaresMetadata
  }>,
  global: {
    middlewares: WebsocketEventMiddlewaresMetadata
  }
}

export type WebsocketEventRuleItem = Map<WebsocketEventRuleItemData['event'], WebsocketEventRuleItemData>

export type WebsocketEventRules = Map<WebsocketEventDecoratorOptions['path'], WebsocketEventRuleItem>

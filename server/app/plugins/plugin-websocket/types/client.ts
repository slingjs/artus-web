import { ArtusApplication } from '@artus/core'
import { BaseContext, BaseInput, BaseOutput, Middleware } from '@artus/pipeline'
import { IncomingMessage } from 'http'
import ws from 'ws'
import { WebsocketEventDecoratorOptions, WebsocketEventMetadata, WebsocketEventMiddlewaresMetadata } from './decorator'
import { WebsocketTrigger } from '../trigger'

export const ARTUS_PLUGIN_WEBSOCKET_CLIENT = 'ARTUS_PLUGIN_WEBSOCKET_CLIENT'

export const ARTUS_PLUGIN_WEBSOCKET_TRIGGER = 'ARTUS_PLUGIN_WEBSOCKET_TRIGGER'

export enum WebSocketEventNames {
  CONNECTION = 'connection',
  MESSAGE = 'message'
}

export interface WebsocketConfig {
  host: string
  port: number
}

export type WebsocketHandlerArgumentsRecord = {
  app: ArtusApplication,
  req: IncomingMessage,
  socket: ws.WebSocket,
  socketServer: ws.WebSocketServer,
  arguments: any[],
  trigger: WebsocketTrigger
}

export type WebsocketHandlerOutputData = {}

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
  }>
}

export type WebsocketEventRuleItem = Map<WebsocketEventRuleItemData['event'], WebsocketEventRuleItemData>

export type WebsocketEventRules = Map<WebsocketEventDecoratorOptions['path'], WebsocketEventRuleItem>

export type WebsocketEventResponseBody = undefined | string | object

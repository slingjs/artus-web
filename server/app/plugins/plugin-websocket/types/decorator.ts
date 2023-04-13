import { ArrayOrPrimitive } from '@sling/artus-web-shared/types'
import { WebSocketEventNames, WebsocketMiddleware } from './client'

export const WEBSOCKET_CONTROLLER_METADATA = 'WEBSOCKET_CONTROLLER_METADATA'
export const WEBSOCKET_EVENT_METADATA = 'WEBSOCKET_EVENT_METADATA'
export const WEBSOCKET_MIDDLEWARE_METADATA = 'WEBSOCKET_MIDDLEWARE_METADATA'
export const WEBSOCKET_CONTROLLER_TAG = 'WEBSOCKET_CONTROLLER_TAG'

export type WebsocketControllerDecoratorOptions = {
  order: number
}

export interface WebsocketControllerMetadata {
  prefix: string
  options?: Partial<WebsocketControllerDecoratorOptions>
}

export type WebsocketEventDecoratorOptions = {
  path: string
  order: number
}

export interface WebsocketEventMetadata {
  eventName: WebSocketEventNames
  options?: Partial<WebsocketEventDecoratorOptions>
}

export type WebsocketEventMiddlewaresMetadata = Array<ArrayOrPrimitive<WebsocketMiddleware>>

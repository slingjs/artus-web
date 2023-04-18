import {
  WEBSOCKET_CONTROLLER_METADATA,
  WEBSOCKET_CONTROLLER_TAG,
  WEBSOCKET_EVENT_METADATA,
  WEBSOCKET_MIDDLEWARE_METADATA,
  WebsocketControllerDecoratorOptions,
  WebsocketControllerMetadata,
  WebsocketEventDecoratorOptions,
  WebsocketEventMetadata,
  WebsocketEventMiddlewaresMetadata,
  WebsocketMiddleware
} from './types'
import { addTag, Injectable, ScopeEnum } from '@artus/core'
import { ArrayOrPrimitive } from '@sling/artus-web-shared/types'
import {
  websocketControllerDecoratorDefaultOptions,
  websocketEventDecoratorDefaultOptions
} from './constants/decorator'

export function WebsocketController(
  prefix: string,
  options: Partial<WebsocketControllerDecoratorOptions> = websocketControllerDecoratorDefaultOptions
): ClassDecorator {
  return function (target) {
    const controllerMetadata = {
      prefix,
      options
    } as WebsocketControllerMetadata

    Reflect.defineMetadata(WEBSOCKET_CONTROLLER_METADATA, controllerMetadata, target)
    addTag(WEBSOCKET_CONTROLLER_TAG, target)
    Injectable({ scope: ScopeEnum.EXECUTION })(target)
  }
}

export function WebsocketEvent(
  eventName: WebsocketEventMetadata['eventName'],
  options: Partial<WebsocketEventDecoratorOptions> = websocketEventDecoratorDefaultOptions
) {
  return function (
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<WebsocketMiddleware>
  ) {
    const eventMetadata = {
      eventName,
      options
    } as WebsocketEventMetadata

    Reflect.defineMetadata(WEBSOCKET_EVENT_METADATA, eventMetadata, descriptor.value!)
  }
}

export function WebsocketUse(middlewares: ArrayOrPrimitive<WebsocketMiddleware>) {
  return function (
    target: Object,
    _key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<WebsocketMiddleware>
  ) {
    // Class Decorator.
    if (arguments.length === 1) {
      const clazzControllerMiddlewaresMetadata: WebsocketEventMiddlewaresMetadata =
        Reflect.getMetadata(WEBSOCKET_MIDDLEWARE_METADATA, target) ?? []

      clazzControllerMiddlewaresMetadata.push(middlewares)
      Reflect.defineMetadata(
        WEBSOCKET_MIDDLEWARE_METADATA,
        clazzControllerMiddlewaresMetadata,
        target
      )

      return
    }

    // Method Decorator.
    const methodEventMiddlewaresMetadata: WebsocketEventMiddlewaresMetadata =
      Reflect.getMetadata(WEBSOCKET_MIDDLEWARE_METADATA, target) ?? []
    methodEventMiddlewaresMetadata.push(middlewares)

    Reflect.defineMetadata(
      WEBSOCKET_EVENT_METADATA,
      methodEventMiddlewaresMetadata,
      descriptor!.value!
    )
  }
}

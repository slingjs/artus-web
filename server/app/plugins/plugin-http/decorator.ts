import { addTag, Injectable, ScopeEnum } from '@artus/core'
import {
  HTTP_CONTROLLER_METADATA,
  HTTPControllerMetadata,
  HTTPRouteDecoratorOptions,
  HTTPMethod,
  HTTPMethodRouteDecoratorOptions,
  HTTPRouteMetadata,
  HTTPRouteMiddlewaresMetadata,
  HTTP_ROUTER_METADATA,
  HTTP_CONTROLLER_TAG,
  HTTP_MIDDLEWARE_METADATA,
  HTTPMiddleware, HTTPControllerDecoratorOptions
} from './types'
import { ArrayOrPrimitive } from '@sling/artus-web-shared/types'

export function HTTPController (
  prefix: string = '',
  options: Partial<HTTPControllerDecoratorOptions> = { order: 0 }
): ClassDecorator {
  return target => {
    const controllerMetaData = {
      prefix,
      options
    } as HTTPControllerMetadata

    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, controllerMetaData, target)
    addTag(HTTP_CONTROLLER_TAG, target)
    Injectable({ scope: ScopeEnum.EXECUTION })(target)
  }
}

export function Get (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.GET, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Post (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.POST, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Delete (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.DELETE, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Put (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.PUT, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Patch (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.PATCH, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Head (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.HEAD, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Options (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(HTTP_ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.OPTIONS, options })

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function All (path: string = '', options: Partial<HTTPRouteDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = [
      { path, method: Object.values(HTTPMethod), options } // All support methods.
    ] as HTTPRouteMetadata
    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function HTTPRoute (options: HTTPMethodRouteDecoratorOptions) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    const routeMetadataList = ([] as HTTPRouteMetadata).concat(options)

    Reflect.defineMetadata(HTTP_ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Use (middlewares: ArrayOrPrimitive<HTTPMiddleware>) {
  return function(
    target: Object,
    _key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<HTTPMiddleware>
  ) {
    // Class Decorator.
    if (arguments.length === 1) {
      const clazzRouteMiddlewaresMetadata: HTTPRouteMiddlewaresMetadata = Reflect.getMetadata(
        HTTP_MIDDLEWARE_METADATA,
        target
      ) ?? []

      clazzRouteMiddlewaresMetadata.push(middlewares)
      Reflect.defineMetadata(HTTP_MIDDLEWARE_METADATA, clazzRouteMiddlewaresMetadata, target)

      return
    }

    // Method Decorator.
    const methodRouteMiddlewaresMetadata: HTTPRouteMiddlewaresMetadata = Reflect.getMetadata(
      HTTP_MIDDLEWARE_METADATA,
      descriptor!.value!
    ) ?? []

    methodRouteMiddlewaresMetadata.push(middlewares)
    Reflect.defineMetadata(HTTP_MIDDLEWARE_METADATA, methodRouteMiddlewaresMetadata, descriptor!.value!)
  }
}

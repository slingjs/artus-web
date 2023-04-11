import { addTag, Injectable, ScopeEnum } from '@artus/core'
import {
  CONTROLLER_METADATA,
  HTTPControllerMetadata,
  HTTPDecoratorOptions,
  HTTPMethod,
  HTTPMethodDecoratorOptions,
  HTTPRouteMetadata,
  HTTPRouteMiddlewaresMetadata,
  ROUTER_METADATA,
  WEB_CONTROLLER_TAG,
  WEB_MIDDLEWARE_METADATA
} from './types'
import { Middleware, MiddlewareInput } from '@artus/pipeline/src/base'

export function HTTPController (prefix: string = '', order: number = 0): ClassDecorator {
  return target => {
    const controllerMetaData = {
      prefix,
      order
    } as HTTPControllerMetadata

    Reflect.defineMetadata(CONTROLLER_METADATA, controllerMetaData, target)
    addTag(WEB_CONTROLLER_TAG, target)
    Injectable({ scope: ScopeEnum.EXECUTION })(target)
  }
}

export function Get (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.GET, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Post (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.POST, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Delete (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.DELETE, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Put (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.PUT, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Patch (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.PATCH, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Head (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.HEAD, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Options (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = (Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []) as HTTPRouteMetadata
    routeMetadataList.push({ path, method: HTTPMethod.OPTIONS, options })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function All (path: string = '', options: Partial<HTTPDecoratorOptions> = {}) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = [
      { path, method: Object.values(HTTPMethod), options } // All support methods.
    ] as HTTPRouteMetadata
    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function HTTPRoute (options: HTTPMethodDecoratorOptions) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = ([] as HTTPRouteMetadata).concat(options)

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Use (middlewares: MiddlewareInput) {
  return function(
    target: Object,
    _key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Middleware>
  ) {
    // Class Decorator.
    if (arguments.length === 1) {
      const clazzRouteMiddlewaresMetadata: HTTPRouteMiddlewaresMetadata = Reflect.getMetadata(
        WEB_MIDDLEWARE_METADATA,
        target
      ) ?? []

      clazzRouteMiddlewaresMetadata.push(middlewares)
      Reflect.defineMetadata(WEB_MIDDLEWARE_METADATA, clazzRouteMiddlewaresMetadata, target)

      return
    }

    // Method Decorator.
    const methodRouteMiddlewaresMetadata: HTTPRouteMiddlewaresMetadata = Reflect.getMetadata(
      WEB_MIDDLEWARE_METADATA,
      descriptor!.value!
    ) ?? []

    methodRouteMiddlewaresMetadata.push(middlewares)
    Reflect.defineMetadata(WEB_MIDDLEWARE_METADATA, methodRouteMiddlewaresMetadata, descriptor!.value!)
  }
}

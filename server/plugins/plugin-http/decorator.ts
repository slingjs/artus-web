import { addTag, Injectable, ScopeEnum } from '@artus/core'
import {
  CONTROLLER_METADATA,
  HTTPMethod,
  ROUTER_METADATA,
  WEB_MIDDLEWARE_METADATA,
  WEB_CONTROLLER_TAG,
  HTTPRouteMiddlewaresMetadata
} from './types'
import { Middleware, MiddlewareInput } from '@artus/pipeline/src/base'

export function HTTPController (prefix: string = ''): ClassDecorator {
  return target => {
    const controllerMetaData = {
      prefix
    }

    Reflect.defineMetadata(CONTROLLER_METADATA, controllerMetaData, target)
    addTag(WEB_CONTROLLER_TAG, target)
    Injectable({ scope: ScopeEnum.EXECUTION })(target)
  }
}

export function Get (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.GET })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Post (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.POST })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Delete (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.DELETE })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Put (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.PUT })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Patch (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.PATCH })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Head (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.HEAD })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Options (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.OPTIONS })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function All (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Middleware>
  ) {
    const routeMetadataList = [
      { path, method: Object.values(HTTPMethod) } // All support methods.
    ]
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

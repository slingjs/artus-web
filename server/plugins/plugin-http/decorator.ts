import { addTag, Injectable, ScopeEnum } from '@artus/core'
import { CONTROLLER_METADATA, HTTPHandlerUnit, HTTPMethod, ROUTER_METADATA, WEB_CONTROLLER_TAG } from './types'

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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []
    routeMetadataList.push({ path, method: HTTPMethod.POST })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  }
}

export function Put (path: string = '') {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
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
    descriptor: TypedPropertyDescriptor<HTTPHandlerUnit>
  ) {
    const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, descriptor.value!) ?? []

    Object.values(HTTPMethod).forEach(m => {
      routeMetadataList.push({ path, method: m })
    })

    Reflect.defineMetadata(ROUTER_METADATA, routeMetadataList, descriptor.value!)
  } as any
}

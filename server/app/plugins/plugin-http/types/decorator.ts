import { ArrayOrPrimitive } from '@sling/artus-web-shared/types'
import { HTTPMiddleware } from './client'

export const HTTP_ROUTER_METADATA = 'HTTP_ROUTER_METADATA'
export const HTTP_CONTROLLER_METADATA = 'HTTP_CONTROLLER_METADATA'
export const HTTP_MIDDLEWARE_METADATA = 'HTTP_MIDDLEWARE_METADATA'
export const HTTP_CONTROLLER_TAG = 'HTTP_CONTROLLER_TAG'

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PUT = 'PUT'
}

export type HTTPControllerDecoratorOptions = {
  order: number
}

export interface HTTPControllerMetadata {
  prefix: string
  options?: Partial<HTTPControllerDecoratorOptions>
}

export type HTTPRouteDecoratorOptions = {
  useBodyParser: boolean
  bodyParserOptions: any
  bodyParserType: 'json' | 'raw' | 'text' | 'urlencoded'
}

export type HTTPRouteMetadata = Array<{
  path: string
  method: ArrayOrPrimitive<HTTPMethod[]>,
  options?: Partial<HTTPRouteDecoratorOptions>
}>

export type HTTPMethodRouteDecoratorOptions = ArrayOrPrimitive<HTTPRouteMetadata>

export type HTTPRouteMiddlewaresMetadata = Array<HTTPMiddleware>

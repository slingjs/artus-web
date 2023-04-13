import { MiddlewareInput } from '@artus/pipeline/src/base'
import { ArrayOrPrimitive } from '@sling/artus-web-shared/types'

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

export interface HTTPControllerMetadata {
  prefix: string
  order: number
}

export type HTTPDecoratorOptions = {
  useBodyParser: boolean
  bodyParserOptions: any
  bodyParserType: 'json' | 'raw' | 'text' | 'urlencoded'
}

export type HTTPRouteMetadata = Array<{
  path: string
  method: ArrayOrPrimitive<HTTPMethod[]>,
  options?: Partial<HTTPDecoratorOptions>
}>

export type HTTPMethodDecoratorOptions = ArrayOrPrimitive<HTTPRouteMetadata>

export type HTTPRouteMiddlewaresMetadata = Array<MiddlewareInput>

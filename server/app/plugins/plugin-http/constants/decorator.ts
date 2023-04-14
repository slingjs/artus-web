import { HTTPControllerDecoratorOptions, HTTPRouteDecoratorOptions } from '../types'

export const HTTP_DEFAULT_BODY_PARSER_OPTIONS = {}

// Default 'json'.
export const HTTP_DEFAULT_BODY_PARSER_TYPE = 'json'

export const HTTPControllerDecoratorDefaultOptions: Partial<HTTPControllerDecoratorOptions> = { order: 0 }

export const HTTPRouteDecoratorDefaultOptions: Partial<HTTPRouteDecoratorOptions> = {}

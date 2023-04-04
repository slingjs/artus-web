import { Middleware } from '@artus/pipeline/src/base'

export type MiddlewareGenerator = (...args: any[]) => Middleware

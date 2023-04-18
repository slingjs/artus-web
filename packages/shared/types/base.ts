export type ArrayMember<T> = T extends Array<infer P> | Readonly<Array<infer P>> ? P : never

export type PromiseFulfilledResult<T> = T extends Promise<infer P> ? P : never

export type ArrayOrPrimitive<T> = T extends Array<any> | ReadonlyArray<any>
  ? T | ArrayMember<T>
  : Array<T> | T

export type ISODateString = string

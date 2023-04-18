export function promiseDelay(time: number = 0) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

export function generateOperablePromise<T = any>(invoker?: Function) {
  let resolve: Parameters<ConstructorParameters<typeof Promise<T>>[0]>[0] | undefined = undefined,
    reject: Parameters<ConstructorParameters<typeof Promise<T>>[0]>[1] | undefined = undefined
  const p = new Promise<T>(function (_resolve, _reject) {
    typeof invoker === 'function' && invoker()

    resolve = _resolve
    reject = _reject
  })

  return {
    p,
    resolve: resolve!,
    reject: reject!
  }
}

/**
 * Promise timeout.
 * @param promise {Promise<*>}
 * @param params {{ timeout: number, [errorMsg]: string }}
 * @return Promise<*>
 */
export function promiseTimeout<T>(
  promise: Promise<T>,
  params: { timeout: number; errorMsg?: string }
) {
  const timeoutP = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error(params.errorMsg || 'Promise timeout.'))
    }, params.timeout)
  })

  return Promise.race([promise, timeoutP]).then(function (r) {
    return promise
  })
}

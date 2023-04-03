export function promiseDelay (time: number = 0) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  })
}

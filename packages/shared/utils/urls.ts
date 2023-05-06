/**
 * Update the QueryString Param
 * @param uri {string}
 * @param key {string}
 * @param value {string}
 */
export function updateQueryStringParam(uri: string, key: string, value: string): string {
  if (!value) return uri
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'
  return re.test(uri) ? uri.replace(re, '$1' + key + '=' + value + '$2') : uri + separator + key + '=' + value
}

/**
 * Update the Query Param.
 * @param uri {string}
 * @param queryObj {Object<any>}
 * @return {string}
 */
export function updateQueryParam(uri: string, queryObj: Record<string, any>): string {
  for (const key in queryObj) {
    if (!queryObj.hasOwnProperty(key)) continue

    // @ts-ignore
    uri = updateQueryStringParam(uri, key, queryObj[key])
  }

  return uri
}

/**
 * Remove the QueryString Param
 * @param uri {string}
 * @param keys {string|string[]}
 */
export function removeQueryStringParam(uri: string, keys: string | string[]): string {
  // @ts-ignore
  ;[].concat(keys).map(function (key) {
    if (!key) return
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
    if (re.test(uri)) {
      uri = uri.replace(re, function (str, $1, $2) {
        return $1 && $1.startsWith('?') ? $2.replace('&', '?') : $2
      })
    }
  })
  return uri
}

/**
 * Get the query value from target search string.
 * @param targetSearchString {string}
 * @param name {string}
 * @param ignoreCase {boolean}
 * @return {string|null}
 */
export function getQueryStringFormTargetSearch(
  targetSearchString: string,
  name: string,
  ignoreCase: boolean = false
): string | null {
  if (!(targetSearchString && typeof targetSearchString === 'string')) {
    return null
  }

  const reg = new RegExp('(?:[?|&]?)' + name + '=([^&]*)(?:&|$)', ignoreCase ? 'i' : undefined)
  const r = targetSearchString.match(reg)
  if (r != null) return decodeURIComponent(r[1])

  return null
}

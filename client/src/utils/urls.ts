import shared from '@sling/artus-web-shared'

let tempAnchor: HTMLAnchorElement | undefined
let tempFragment: DocumentFragment | undefined

export function formatHTTPUrlWithFragment(urlFragment: string) {
  if (!tempAnchor) {
    tempAnchor = document.createElement('a')
  }

  if (!tempFragment) {
    tempFragment = document.createDocumentFragment()
  }

  if (!tempFragment.contains(tempAnchor)) {
    tempFragment.append(tempAnchor)
  }

  tempAnchor.href = urlFragment

  return tempAnchor.href
}

export function formatWebsocketUrlWithFragment(urlFragment: string) {
  const href = new URL(formatHTTPUrlWithFragment(urlFragment))

  href.protocol = 'ws'

  return href.toString()
}

export function getQueryString(name: string, ignoreCase: boolean = false) {
  return shared.utils.getQueryStringFormTargetSearch(location.search, name, ignoreCase)
}

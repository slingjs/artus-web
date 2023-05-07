import type { Plugin } from 'vite'
import shared from '@sling/artus-web-shared'

/**
 * @see https://stackoverflow.com/a/75644929
 */
export const transformHTMLPlugin: () => Plugin = () => ({
  name: 'transform-html',
  enforce: 'post',
  transformIndexHtml(html) {
    if (shared.utils.judgeBuildModeInDevelopment()) {
      const ejs = require('ejs')

      return ejs.render(html, {
        csrfToken: shared.utils.getSupremeCsrfToken()
      })
    }
  }
})

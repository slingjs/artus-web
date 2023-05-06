import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_PLUGIN_VIEW_CLIENT, ViewConfig } from './types'
import ejs from 'ejs'
import type { Data, Options } from 'ejs'
import _ from 'lodash'
import path from 'path'

@Injectable({
  id: ARTUS_PLUGIN_VIEW_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class ViewClient {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  private renderOptions: ViewConfig['renderOptions']

  async init(config: ViewConfig) {
    this.renderOptions = _.get(config, 'renderOptions')
  }

  private formatPath(p: string, opts?: Options) {
    const root = _.get(opts, 'root') as string
    if (!root) {
      return p
    }

    return path.join(root, p)
  }

  private formatOpts(opts?: Options) {
    return _.merge({}, this.renderOptions, opts)
  }

  render(path: string, data?: Data, opts?: Options) {
    const formattedOpts = this.formatOpts(opts)
    return ejs.renderFile(this.formatPath(path, formattedOpts), data, formattedOpts)
  }

  renderStr(template: string, data?: Data, opts?: Options) {
    return ejs.render(template, data, this.formatOpts(opts))
  }
}

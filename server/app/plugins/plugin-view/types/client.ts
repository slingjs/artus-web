import type ejs from 'ejs'

export const ARTUS_PLUGIN_VIEW_CLIENT = 'ARTUS_PLUGIN_VIEW_CLIENT'

export interface ViewConfig {
  renderOptions: ejs.Options
}

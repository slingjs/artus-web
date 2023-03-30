import { ArtusApplication, Injectable, Scanner, ScopeEnum } from '@artus/core'
import fs from 'fs-extra'
import { ARTUS_FRAMEWORK_WEB_CLIENT } from './types/client'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class FrameworkWebClient {
  private frameworkApp: ArtusApplication

  public async init (app: ArtusApplication, options: any = {}) {
    const scanner = new Scanner({
      app,
      appName: 'framework-web',
      extensions: ['.ts'],
      configDir: 'config',
      framework: options.framework || { path: __dirname },
      exclude: options.exclude || ['test']
    })

    const baseDir = options.baseDir || __dirname
    const manifest = await scanner.scan(baseDir)

    // Start app.
    const artusEnv = options.artusEnv || 'default'
    const frameworkApp = new ArtusApplication()
    await frameworkApp.load(manifest[artusEnv], baseDir)

    // Ensure cache dir.
    const cacheDir = app.config.cacheDir
    await fs.ensureDir(cacheDir)

    await frameworkApp.run()

    this.frameworkApp = frameworkApp
  }

  getFrameworkApp () {
    return this.frameworkApp
  }
}

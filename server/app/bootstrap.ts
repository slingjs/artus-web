import 'reflect-metadata'
import { ArtusApplication, Scanner } from '@artus/core'
import dotEnv from 'dotenv'
import { get__dirname } from './utils/compatibility'

dotEnv.config()

export async function start (options: any = {}) {
  const scanner = new Scanner({
    appName: 'application',
    needWriteFile: false,
    extensions: ['.ts'],
    configDir: 'config',
    framework: options.framework || { path: get__dirname() },
    exclude: options.exclude || ['test']
  })

  const baseDir = options.baseDir || get__dirname()
  const manifest = await scanner.scan(baseDir)

  // Start app.
  const artusEnv = options.artusEnv || 'default'
  const app = new ArtusApplication()

  await app.load(manifest[artusEnv], baseDir)

  await app.run()

  return app
}

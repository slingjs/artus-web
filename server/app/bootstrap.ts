import 'reflect-metadata'
import { ArtusApplication, Scanner } from '@artus/core'
import dotEnv from 'dotenv'

dotEnv.config()

export async function start (options: any = {}) {
  const scanner = new Scanner({
    appName: 'application',
    needWriteFile: false,
    extensions: ['.ts'],
    configDir: 'config',
    framework: options.framework || { path: __dirname },
    exclude: options.exclude || ['test']
  })

  const baseDir = options.baseDir || __dirname
  const manifest = await scanner.scan(baseDir)

  // Start app.
  const artusEnv = options.artusEnv || 'default'
  const app = new ArtusApplication()

  await app.load(manifest[artusEnv], baseDir)

  await app.run()

  return app
}

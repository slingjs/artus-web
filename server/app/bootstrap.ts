import 'reflect-metadata'
import { ArtusApplication, ArtusScanner } from '@artus/core'
import dotEnv from 'dotenv'
import fsExtra from 'fs-extra'
import { AppConfig } from './types'

dotEnv.config()

export async function start(options: any = {}) {
  const scanner = new ArtusScanner({
    needWriteFile: false,
    extensions: ['.ts'],
    configDir: 'config',
    exclude: options.exclude || ['test']
  })

  const baseDir = options.baseDir || __dirname
  const manifest = await scanner.scan(baseDir)

  // Start app.
  const app = new ArtusApplication()

  await app.load(manifest, baseDir)

  // Add cache dir.
  const cacheDir = options.cacheDir || (app.config as AppConfig).cacheDir
  if (cacheDir) {
    await fsExtra.ensureDir(cacheDir)
  }

  await app.run()

  return app
}

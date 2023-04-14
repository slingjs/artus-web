import fs from 'fs-extra'
import path from 'path'
import { globSync } from 'glob'

// Copy the models.
globSync(
  ['./**'],
  { cwd: path.resolve(__dirname, '../app/frameworks/framework-web/models'), ignore: '**/generated/**' }
).forEach(p => {
  const fullPath = path.resolve(__dirname, '../app/frameworks/framework-web/models', p)
  if (fs.statSync(fullPath).isDirectory()) {
    return
  }

  const targetPath = path.resolve(__dirname, '../dist/app/frameworks/framework-web/models', p)
  fs.copySync(
    fullPath,
    targetPath
  )
})

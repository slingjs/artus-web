const fs = require('fs-extra')
const path = require('path')
const { globSync } = require('glob')

// Copy the models.
globSync(['./**'], {
  cwd: path.resolve(__dirname, '../app/models'),
  ignore: ['**/generated/**', '**/*seed.ts']
}).forEach(p => {
  const fullPath = path.resolve(__dirname, '../app/models', p)
  if (fs.statSync(fullPath).isDirectory()) {
    return
  }

  const targetPath = path.resolve(__dirname, '../dist/app/models', p)
  fs.copySync(fullPath, targetPath)
})

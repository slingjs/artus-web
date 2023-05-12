const fs = require('fs-extra')
const path = require('path')
const { globSync } = require('glob')

// Copy the models.
globSync(['./**'], {
  cwd: path.resolve(__dirname, '../app/frameworks/framework-web/models'),
  ignore: ['**/generated/**', '**/casbin/*-seed.ts']
}).forEach(p => {
  const fullPath = path.resolve(__dirname, '../app/frameworks/framework-web/models', p)
  if (fs.statSync(fullPath).isDirectory()) {
    return
  }

  const targetPath = path.resolve(__dirname, '../dist/app/frameworks/framework-web/models', p)
  fs.copySync(fullPath, targetPath)
})

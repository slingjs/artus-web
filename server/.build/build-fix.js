const fs = require('fs-extra');
const path = require('path');

// Copy the models.
fs.copySync(
  path.resolve(__dirname, '../app/frameworks/framework-web/models'),
  path.resolve(__dirname, '../dist/app/frameworks/framework-web/models')
)

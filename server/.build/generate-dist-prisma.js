const { spawnSync } = require('child_process')

// Generate prisma schemas.
spawnSync(
  `
  npx prisma generate --schema ../dist/app/frameworks/framework-web/models/mongo/schema.prisma &&
  npx prisma generate --schema ../dist/app/frameworks/framework-web/models/mysql/schema.prisma
  `.trim()
)

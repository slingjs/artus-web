import path from 'path'
import fs from 'fs'
import { AppConfig } from '../types'
import shared from '@sling/artus-web-shared'

const processCwd = process.cwd()
const cacheDir = process.env.CACHE_DIR ?? path.resolve(processCwd, './.cache')
const distDir =
  process.env.DIST_DIR ??
  ([
    path.resolve(
      // For local dev.
      processCwd,
      './node_modules/@sling/artus-web-client',
      shared.constants.FILE_BASE_DIR
    ),
    path.resolve(
      // For npm package/docker compose.
      processCwd,
      '../artus-web-client',
      shared.constants.FILE_BASE_DIR
    )
  ].find(p => fs.existsSync(p)) ||
    '__nonexistent__')

export default {
  cacheDir,

  plugin: {
    http: {
      host: process.env.HTTP_HOST || '0.0.0.0',
      port: +process.env.HTTP_PORT! || shared.constants.SERVER_PORT, // Will use this.
      cacheDir: path.resolve(cacheDir, 'plugins/http'),
      requestPathCaseSensitive: false
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: +process.env.REDIS_PORT! || 6379,
      db: +process.env.REDIS_DB! || 0,
      username: process.env.REDIS_USERNAME || '',
      password: process.env.REDIS_PASSWORD || '123456'
    },
    cache: {
      // maxSize: 5000, // If set this. Need a calculator ('sizeCalculation' property) to measure the value's size.
      max: 500,
      ttl: 1000 * 60 * 5,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false
    },
    prisma: {
      dataSources: {
        mongo: {
          enable: true,
          schemaOutputPath: path.resolve(__dirname, '../frameworks/framework-web/models/mongo/generated/client'),
          envs: {
            // https://www.mongodb.com/compatibility/deploying-a-mongodb-cluster-with-docker
            MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/test?replicaSet=rs0'
          }
        },
        mysql: {
          enable: true,
          schemaOutputPath: path.resolve(__dirname, '../frameworks/framework-web/models/mysql/generated/client'),
          envs: {
            // https://hub.docker.com/_/mysql
            MYSQL_URI: process.env.MYSQL_URI || 'mysql://root:123456@localhost:3306/test'
          }
        }
      }
    },
    websocket: {
      host: process.env.WEBSOCKET_HOST || '0.0.0.0',
      port: +process.env.WEBSOCKET_HOST! || shared.constants.SERVER_PORT,
      useSharedHTTPServer: true, // Use shared http server or not. The 'http' plugin may register that server.
      requestPathCaseSensitive: false
    },
    view: {
      renderOptions: {
        async: true,
        root: distDir,
        debug: false
      }
    }
  },

  framework: {
    web: {
      cacheDir: path.resolve(cacheDir, 'frameworks/web'),
      distDir,
      api: {
        account: {
          // Should one account sign in multiple time at the mean time that last session didn't expire?
          enableMultipleSignedInSessions: !!(process.env.WEB_API_ACCOUNT_ENABLE_MULTIPLE_SIGNED_IN_SESSION ?? false),
          enableRecordMultipleSignedInSessions: !!(
            process.env.WEB_API_ACCOUNT_ENABLE_RECORDS_MULTIPLE_SIGNED_IN_SESSIONS ?? false
          )
        }
      },
      security: {
        csrf: {
          supremeToken: shared.utils.getSupremeCsrfToken()
        }
      }
    }
  }
} as AppConfig

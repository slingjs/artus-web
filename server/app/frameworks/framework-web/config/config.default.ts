import { AppConfig } from '../../../types'
import path from 'path'

export default {
  plugin: {
    http: {
      host: '0.0.0.0',
      port: 9528,
      requestPathCaseSensitive: false
    },
    redis: {
      host: 'localhost',
      port: 6379,
      db: 0,
      username: '',
      password: '123456'
    },
    cache: {
      maxSize: 5000,
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
          schemaOutputPath: path.resolve(__dirname, '../models/mongo/generated/client'),
          envs: {
            // https://www.mongodb.com/compatibility/deploying-a-mongodb-cluster-with-docker
            MONGO_URI: 'mongodb://localhost:27017/test?replicaSet=rs0'
          }
        },
        mysql: {
          enable: true,
          schemaOutputPath: path.resolve(__dirname, '../models/mysql/generated/client'),
          envs: {
            // https://hub.docker.com/_/mysql
            MYSQL_URI: 'mysql://root:123456@localhost:3306/test'
          }
        }
      }
    },
    websocket: {
      host: '0.0.0.0',
      port: 9528,
      useSharedHTTPServer: true,
      requestPathCaseSensitive: false
    },
    view: {
      renderOptions: {
        async: true,
        debug: false
      }
    }
  },
  framework: {
    web: {
      api: {
        account: {
          enableMultipleSignedInSessions: true,
          enableRecordMultipleSignedInSessions: false
        }
      },
      security: {
        csrf: {
          supremeToken: ''
        }
      }
    }
  }
} as AppConfig

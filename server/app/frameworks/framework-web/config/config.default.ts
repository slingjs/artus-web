import { AppConfig } from '../../../types'

export default {
  plugin: {
    http: {
      host: '0.0.0.0',
      port: 9528
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
    }
  },
  framework: {
    web: {}
  }
} as AppConfig

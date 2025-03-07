import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  // admin: {
  //   vite: (config) => {
  //     return {
  //       ...config,
  //       server: {
  //         ...config.server,
  //         hmr: {
  //           protocol: 'wss', // Usar WebSocket Secure
  //           // host: 'naturalim.adaflex.mx', // Tu dominio
  //           port: 43581, // Puerto SSL estándar para el cliente
  //           path: '/vite/hmr', // Ruta personalizada para HMR
  //           timeout: 30000, // Tiempo de espera opcional
  //           clientPort: 443, // Puerto que el cliente usará para conectarse
  //         },
  //       },
  //     };
  //   },
  // },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    workerMode:
      (process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server') ||
      'server',
    redisUrl: process.env.REDIS_URL,
    http: {
      // storeCors: process.env.STORE_CORS || 'http://localhost:8000',
      storeCors: 'https://naturalim3.netlify.app',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000',
      authCors:
        process.env.AUTH_CORS || 'http://localhost:8000,http://localhost:9000',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
      jwtExpiresIn: '4h',
    },
  },
  modules: [
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/openpay',
            id: 'openpay',
            options: {
              apiKey: 'sk_09565b022fd8461698de06e6bdc2a67a',
              merchantId: 'mzf9mmojexntfllthzal',
              production: false,
              capture: true,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/cache-redis',
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/openpay',
            options: {
              apiKey: 'sk_09565b022fd8461698de06e6bdc2a67a',
              merchantId: 'mzf9mmojexntfllthzal',
              production: false,
              capture: true,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-s3',
            id: 's3',
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              // other options...
            },
          },
        ],
      },
    },
  ],
});

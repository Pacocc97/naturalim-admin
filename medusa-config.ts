import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  admin: {
    vite: (config) => {
      return {
        ...config,
        server: {
          ...config.server,
          hmr: {
            protocol: 'wss', // Usar WebSocket Secure
            // host: 'naturalim.adaflex.mx', // Tu dominio
            port: 43581, // Puerto SSL estándar para el cliente
            path: '/vite/hmr', // Ruta personalizada para HMR
            timeout: 30000, // Tiempo de espera opcional
            clientPort: 443, // Puerto que el cliente usará para conectarse
          },
        },
      };
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    workerMode:
      (process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server') ||
      'server',
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS! || 'http://localhost:5000',
      adminCors: process.env.ADMIN_CORS! || 'http://localhost:5000',
      authCors: process.env.AUTH_CORS! || 'http://localhost:5000',
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
      resolve: './src/modules/hello',
    },
  ],
});

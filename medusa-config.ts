import { loadEnv, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
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
      resolve: './src/modules/hello',
    },
    {
      resolve: './src/modules/brand',
    },
    {
      resolve: './src/modules/brand',
      options: {
        apiKey: process.env.BRAND_API_KEY || 'temp',
      },
    },
  ],
});

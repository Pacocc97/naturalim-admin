import { defineMiddlewares, authenticate } from '@medusajs/medusa';
import { z } from 'zod';
import {
  validateAndTransformBody,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from '@medusajs/framework/http';
import { PostStoreCustomSchema } from './custom/validators';
import { MedusaError, parseCorsOrigins } from '@medusajs/framework/utils';
import { ConfigModule } from '@medusajs/framework';
import cors from "cors"

export default defineMiddlewares({
  routes: [
    {
      matcher: '/admin/products',
      method: ['POST'],
      additionalDataValidator: {
        brand_id: z.string().optional(),
        brand: z.string().optional(),
      },
    },
    {
      matcher: '/custom/admin*',
      middlewares: [authenticate('user', ['session', 'bearer', 'api-key'])],
    },
    {
      matcher: '/custom/customer*',
      middlewares: [authenticate('customer', ['session', 'bearer'])],
    },
    {
      matcher: "/custom*",
      middlewares: [
        (
          req: MedusaRequest, 
          res: MedusaResponse, 
          next: MedusaNextFunction
        ) => {
          const configModule: ConfigModule =
            req.scope.resolve("configModule")

          return cors({
            origin: parseCorsOrigins(
              configModule.projectConfig.http.storeCors
            ),
            credentials: true,
          })(req, res, next)
        },
      ],
    },
    // {
    //   matcher: "/custom",
    //   method: "POST",
    //   middlewares: [
    //     validateAndTransformBody(PostStoreCustomSchema),
    //   ]
    // },
  ],
  errorHandler: (
    error: MedusaError | any,
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction,
  ) => {
    res.status(400).json({
      error: 'Something happened.',
    });
  },
});

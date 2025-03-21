import { defineMiddlewares, authenticate } from '@medusajs/medusa';
import { z } from 'zod';
import {
  validateAndTransformBody,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from '@medusajs/framework/http';
import { MedusaError, parseCorsOrigins } from '@medusajs/framework/utils';
import { ConfigModule } from '@medusajs/framework';
import cors from 'cors';
import { raw } from 'body-parser';

export default defineMiddlewares({
  routes: [
    {
      matcher: '/admin/products',
      method: ['POST'],
      additionalDataValidator: {},
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
      matcher: '/custom*',
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const configModule: ConfigModule = req.scope.resolve('configModule');

          return cors({
            origin: parseCorsOrigins(configModule.projectConfig.http.storeCors),
            credentials: true,
          })(req, res, next);
        },
      ],
    },
    {
      method: ['POST', 'PUT'],
      matcher: '/webhooks/*',
      bodyParser: { preserveRawBody: true },
      middlewares: [raw({ type: 'application/json' })],
    },
  ],
  errorHandler: (
    error: MedusaError | any,
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction,
  ) => {
    // Get appropriate status code based on error type
    let statusCode = 500;
    if (error instanceof MedusaError) {
      statusCode = getStatusCodeFromType(error.type);
    }

    res.status(statusCode).json({
      error: error.message || 'An unexpected error occurred',
      type: error instanceof MedusaError ? error.type : 'unknown_error',
    });
  },
});
function getStatusCodeFromType(type: string): number {
  switch (type) {
    case MedusaError.Types.NOT_FOUND:
      return 404;
    case MedusaError.Types.INVALID_DATA:
    case MedusaError.Types.INVALID_ARGUMENT:
      return 400;
    case MedusaError.Types.UNAUTHORIZED:
      return 401;
    case MedusaError.Types.DUPLICATE_ERROR:
    case MedusaError.Types.CONFLICT:
      return 409;
    case MedusaError.Types.DB_ERROR:
    case MedusaError.Types.UNEXPECTED_STATE:
    default:
      return 500;
  }
}

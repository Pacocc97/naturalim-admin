import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { HELLO_MODULE } from 'src/modules/hello';
import HelloModuleService from 'src/modules/hello/service';
import { PostStoreCustomSchema } from './validators';
import { z } from 'zod';

type PostStoreCustomSchemaType = z.infer<typeof PostStoreCustomSchema>;

export const POST = async (
  req: MedusaRequest<PostStoreCustomSchemaType>,
  res: MedusaResponse,
) => {
  res.json({
    sum: req.validatedBody.a + req.validatedBody.b,
  });
};

export const GET = async (
    req: AuthenticatedMedusaRequest, 
    res: MedusaResponse
  ) => {
    res.json({
      message: "Hello",
    })
  }
  
  export const AUTHENTICATE = false

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   res.status(429).json({
//     message: 'Hello, World!',
//   });
// };

// export async function GET(
//     req: MedusaRequest,
//     res: MedusaResponse
// ): Promise<void>{
//     const helloModuleService: HelloModuleService = req.scope.resolve(
//         HELLO_MODULE
//     )

//     const my_custom = await helloModuleService.createMyCustoms({
//         name:"test"
//     })

//     res.json({
//         my_custom
//     })
// }


// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   res.writeHead(200, {
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache',
//     Connection: 'keep-alive',
//   });

//   const interval = setInterval(() => {
//     res.write('Streaming data...\n');
//   }, 3000);

//   req.on('end', () => {
//     clearInterval(interval);
//     res.end();
//   });
// };

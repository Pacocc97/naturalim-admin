import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

type HelloWorldReq = {
  name: string;
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.json({
    message: `Hello ${req.query.name}`,
  });
};

export const POST = async (
  req: MedusaRequest<HelloWorldReq>,
  res: MedusaResponse,
) => {
  res.json({
    message: `[POST] Hello ${req.body.name}!`,
  });
};

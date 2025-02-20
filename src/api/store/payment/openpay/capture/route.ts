import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const paymentModuleService = req.scope.resolve(Modules.PAYMENT);

  const payment = await paymentModuleService.capturePayment({
    payment_id: 'pay_123',
  });

  res.json({
    payment,
  });
}

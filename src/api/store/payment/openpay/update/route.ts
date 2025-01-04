import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

type ChargeAuth = {
  paymentSessionId: string;
  amount: number;
  currency_code: string;
  data: {
    card_token: string;
  };
};

export async function POST(
  req: MedusaRequest<ChargeAuth>,
  res: MedusaResponse,
): Promise<void> {
  try {
    // Parsear y extraer los datos del cuerpo de la solicitud
    const { paymentSessionId, amount, currency_code, data } = req.body;
    console.log(
      'Datos recibidos en POST /store/payment/openpay/authorize:',
      req.body,
    );

    // Validar que todos los campos requeridos estén presentes
    if (!paymentSessionId || !amount || !currency_code) {
      throw new Error(
        'Faltan campos requeridos: paymentSessionId, amount, currency_code',
      );
    }

    // Resolver el servicio de pagos
    const paymentModuleService = req.scope.resolve(Modules.PAYMENT);

    // Autorizar la sesión de pago utilizando los datos recibidos
    const paymentSession = await paymentModuleService.updatePaymentSession({
      id: paymentSessionId,
      currency_code: currency_code,
      amount: amount,
      data: { ...data },
    });

    // Responder al cliente con la sesión de pago
    res.json({ paymentSession });
  } catch (error: any) {
    // Registrar el error completo en el servidor para facilitar la depuración
    console.error('Error al autorizar la sesión de pago:', error);

    // Responder al cliente con un mensaje de error detallado
    res.status(400).json({
      error: error.message || 'Error desconocido al autorizar el pago',
    });
  }
}

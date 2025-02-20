import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

type ChargeAuth = {
  paymentSessionId: string;
  data: {
    source_id: string;
    method: string;
    amount: number;
    currency?: string;
    description: string;
    order_id?: string;
    device_session_id: string;
    customer: {
      name: string;
      last_name?: string;
      email: string;
      phone_number?: string;
    };
  };
};

export async function POST(
  req: MedusaRequest<ChargeAuth>,
  res: MedusaResponse,
): Promise<void> {
  try {
    // Parsear y extraer los datos del cuerpo de la solicitud
    const { paymentSessionId, data } = req.body;
    console.log(
      'Datos recibidos en POST /store/payment/openpay/authorize:',
      req.body,
    );

    // Validar que todos los campos requeridos estén presentes
    // if (!tokenId || !deviceSessionId || !cartId || !amount) {
    //   throw new Error(
    //     'Faltan campos requeridos: tokenId, deviceSessionId, cartId, amount',
    //   );
    // }

    // Resolver el servicio de pagos
    const paymentModuleService = req.scope.resolve(Modules.PAYMENT);

    // Autorizar la sesión de pago utilizando los datos recibidos
    const paymentSession = await paymentModuleService.authorizePaymentSession(
      paymentSessionId, // Asegúrate de que cartId corresponde al ID de colección de pagos correcto
      {
        ...data,
      },
    );

    // Registrar la sesión de pago autorizada
    console.log('Sesión de pago autorizada:', paymentSession);

    // Responder al cliente con la sesión de pago
    res.json({
      redirect_url: (paymentSession.data.payment_method as { url: string }).url,
      // redirect_url: paymentSession.data.payment_method.url,
    });
  } catch (error: any) {
    // Registrar el error completo en el servidor para facilitar la depuración
    console.error('Error al autorizar la sesión de pago:', error);

    // Responder al cliente con un mensaje de error detallado
    res.status(400).json({
      error: error.message || 'Error desconocido al autorizar el pago',
    });
  }
}

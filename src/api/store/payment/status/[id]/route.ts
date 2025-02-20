import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  console.log(
    'Datos recibidos en POST /store/payment/openpay/capture:',
    req.params.id,
  );
  try {
    const { id } = req.params;
    const paymentSessionId = id;
    // Parsear y extraer los datos del cuerpo de la solicitud

    // Resolver el servicio de pagos
    const paymentModuleService = req.scope.resolve(Modules.PAYMENT);

    // Autorizar la sesión de pago utilizando los datos recibidos
    const paymentSession =
      await paymentModuleService.retrievePaymentSession(paymentSessionId); // Asegúrate de que cartId corresponde al ID de colección de pagos correcto

    // Registrar la sesión de pago autorizada
    console.log('Sesión de pago autorizada:', paymentSession);

    // Responder al cliente con la sesión de pago
    res.json({
      payment_session: paymentSession,
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

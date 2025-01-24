import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/utils';
import OpenpayProviderService from 'src/modules/openpay/service';

// Esta función asume que el body del request ya viene parseado
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Obtenemos la instancia del servicio (ya registrada en Container)
    console.log('REQ', req.body);

    // Aseguramos que req.body es del tipo Record<string, unknown>
    const parsedBody = req.body as Record<string, unknown>;

    // Usamos el método getWebhookActionAndData para parsear el payload
    const openpayProvider = req.scope.resolve(Modules.PAYMENT);
    const session = await openpayProvider.retrievePaymentSession(
      (parsedBody.metadata as Record<string, any>).session_id,
    );

    console.log('session', session);
    const { action, data } = await openpayProvider.getWebhookActionAndData({
      provider: 'openpay_openpay',
      payload: {
        data: parsedBody, // data principal
        rawData: req.rawBody, // data sin procesar (si lo deseas)
        headers: req.headers, // headers si los necesitas
      },
    });

    if (action === 'captured') {
      // Aquí, en data probablemente tengas el session_id
      // entonces obtienes la sesión o el payment:
      const session = await openpayProvider.retrievePaymentSession(
        data.session_id,
      );

      // y ahora llamas al capturePayment con session.payment.id
      await openpayProvider.capturePayment({ payment_id: session.payment.id });
    }

    // // Aquí podrías hacer cualquier proceso extra que necesites
    console.log('action:', action);
    console.log('data:', data);

    // Al final, respondes con lo que quieres
    return res.json({ status: 'OK' });
  } catch (err) {
    console.error('Error en webhook', err);
    return res.status(500).json({ error: err.message });
  }
}

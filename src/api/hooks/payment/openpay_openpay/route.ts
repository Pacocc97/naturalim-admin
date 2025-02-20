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

    const { action, data } = await openpayProvider.getWebhookActionAndData({
      provider: 'openpay_openpay',
      payload: {
        data: parsedBody, // data principal
        rawData: req.rawBody, // data sin procesar (si lo deseas)
        headers: req.headers, // headers si los necesitas
      },
    });

    // // Aquí podrías hacer cualquier proceso extra que necesites
    // console.log('action:', action);
    // console.log('data:', data);

    // Al final, respondes con lo que quieres
    return res.json({ status: 'OK' });
  } catch (err) {
    console.error('Error en webhook', err);
    return res.status(500).json({ error: err.message });
  }
}

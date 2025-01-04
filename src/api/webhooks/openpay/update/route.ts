import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

interface Transaction {
  Id: string;
  OrderId: string;
}

interface WebhookEvent {
  Type: string;
  VerificationCode?: string;
  Transaction?: Transaction;
}

// Esta función asume que el body del request ya viene parseado
export async function POST(
  req: MedusaRequest<WebhookEvent>,
  res: MedusaResponse,
) {
  try {
    const webhookEvent = req.body;

    if (!webhookEvent || !webhookEvent.Type) {
      console.error('No se recibió un evento válido.');
      res.status(400);
      return res.json({ error: 'Evento inválido' });
    }

    const eventType = webhookEvent.Type;
    console.log(`Evento de webhook recibido: ${eventType}`);

    if (eventType === 'verification') {
      const verificationCode = webhookEvent.VerificationCode;
      console.log(`Código de verificación recibido: ${verificationCode}`);

      // Procesa el código de verificación si es necesario

      res.status(200);
      return res.json('OK');
    } else if (eventType === 'charge.succeeded') {
      const transaction = webhookEvent.Transaction;

      if (!transaction || !transaction.OrderId) {
        console.warn('El OrderId en la transacción está vacío o es nulo.');
        res.status(400);
        return res.json({ error: 'OrderId en la transacción es obligatorio.' });
      }

      const orderId = transaction.OrderId;
      const updateOrderBody = {
        set_paid: true,
        status: 'processing',
        transaction_id: transaction.Id,
      };

      const updateUrl = `https://naturalim.adaflex.mx/update_order/${orderId}`;
      console.log(
        `Enviando solicitud PUT a ${updateUrl} con el cuerpo:`,
        updateOrderBody,
      );

      try {
        const response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // Añade aquí las cabeceras de autenticación si fueran necesarias
          },
          body: JSON.stringify(updateOrderBody),
        });

        if (response.ok) {
          console.log(`Orden ${orderId} actualizada exitosamente`);
        } else {
          const errorContent = await response.text();
          console.error(
            `Error al actualizar la orden ${orderId}. Status Code: ${response.status}. Respuesta: ${errorContent}`,
          );
        }
      } catch (ex) {
        console.error(
          `Excepción al intentar actualizar la orden ${orderId}:`,
          ex,
        );
      }

      console.log(`Evento procesado: ${eventType}, Transacción:`, transaction);

      res.status(200);
      return res.json('OK');
    } else {
      console.log(`Evento no soportado: ${eventType}`);
      res.status(200);
      return res.json('OK');
    }
  } catch (ex) {
    console.error('Error al procesar el evento de webhook:', ex);
    res.status(400);
    return res.json({ error: 'Error al procesar el evento de webhook' });
  }
}

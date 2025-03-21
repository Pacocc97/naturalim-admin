// src/modules/skydropx/client.ts
import { MedusaError } from '@medusajs/framework/utils';
import { Logger } from '@medusajs/framework/types';

/**
 * Opciones necesarias para autenticar con Skydropx
 */
export type SkyDropxAuthOptions = {
  client_id: string;
  client_secret: string;
};

/**
 * Dependencias que inyecta Medusa en el constructor (opcional, aquí ejemplificamos logger).
 */
type InjectedDependencies = {
  logger: Logger;
};

export class SkyDropxClient {
  protected options: SkyDropxAuthOptions;
  protected logger: Logger;

  protected baseUrl: string;
  protected accessToken: string | null = null;

  // Marca de tiempo para controlar si el token ya expiró y necesitamos renovarlo
  protected tokenExpiration: number | null = null;

  constructor(options: SkyDropxAuthOptions) {
    this.options = options;
    // Base URL productivo de Skydropx (puedes cambiar si usas sandbox/demo):
    // this.baseUrl = 'https://pro.skydropx.com/api/v1';
    this.baseUrl = 'https://sb-pro.skydropx.com/api/v1';
  }

  /**
   * Obtiene y almacena el token OAuth desde Skydropx (client_credentials).
   */
  protected async retrieveToken(): Promise<void> {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      formData.append('client_id', this.options.client_id);
      formData.append('client_secret', this.options.client_secret);

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Error al obtener token. Status: ${response.status}, Body: ${errorBody}`,
        );
      }

      const data = await response.json();
      console.log('Token retrieved: ' + data.access_token);
      this.accessToken = data.access_token;
      // Guardamos la fecha de expiración (en milisegundos)
      if (data.expires_in) {
        this.tokenExpiration = Date.now() + data.expires_in * 1000;
      }
    } catch (err) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `No se pudo obtener el token de Skydropx: ${err}`,
      );
    }
  }

  /**
   * Método base para enviar requests a Skydropx (ya con Bearer Token).
   * Renueva el token si está ausente o expirado.
   */
  protected async sendRequest(path: string, init?: RequestInit): Promise<any> {
    // Verifica si el token está ausente o vencido
    const now = Date.now();
    if (
      !this.accessToken ||
      (this.tokenExpiration && now >= this.tokenExpiration)
    ) {
      await this.retrieveToken();
    }

    const headers = {
      ...init?.headers,
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    let responseBody: any;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Error en Skydropx: Status ${response.status}, Body: ${JSON.stringify(responseBody)}`,
      );
    }

    return responseBody;
  }

  /**
   * Crea una cotización (POST /api/v1/quotations)
   */
  async createQuotation(quotationPayload: any): Promise<any> {
    // Revisa que el body contenga el objeto "quotation" con la estructura que requiere la doc.
    // Por ejemplo: { "quotation": { "order_id": "...", "address_from": { ... }, etc. } }
    console.log('Client: ', this.options.client_id);
    console.log('Client secret: ', this.options.client_secret);

    console.log('Creating quotation: ' + JSON.stringify(quotationPayload));
    return this.sendRequest('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotationPayload),
    })
      .then((response) => {
        // Aquí puedes hacer algo con la respuesta, como guardarla en tu base de datos
        console.log('Quotation created: ' + response);
        return response;
      })
      .catch((error) => {
        console.error('Error creating quotation: ' + error);
      });
  }

  /**
   * Crea una orden (opcional, si la usas)
   */
  async createOrder(orderPayload: any): Promise<any> {
    return this.sendRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  }

  /**
   * Crea un envío (shipment) - Ejemplo
   */
  async createShipment(shipmentPayload: any): Promise<any> {
    return this.sendRequest('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentPayload),
    });
  }

  /**
   * Cancela un envío (POST /api/v1/shipments/{shipment_id}/cancellations)
   */
  async cancelShipment(shipmentId: string, reason: string): Promise<any> {
    return this.sendRequest(`/shipments/${shipmentId}/cancellations`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Agrega más métodos según requieras, p. ej. getShipments, trackShipment, etc.
}

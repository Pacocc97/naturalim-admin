import { AbstractPaymentProvider, BigNumber } from '@medusajs/framework/utils';
import { Logger } from '@medusajs/medusa';
import {
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  CreatePaymentProviderSession,
  UpdatePaymentProviderSession,
  ProviderWebhookPayload,
  WebhookActionResult,
} from '@medusajs/framework/types';
import { json } from 'stream/consumers';

type InjectedDependencies = {
  logger: Logger;
};

type Options = {
  apiKey: string;
  merchantId: string;
  production: boolean;
};

class OpenpayProviderService extends AbstractPaymentProvider<Options> {
  static identifier = 'openpay';

  protected logger_: Logger;
  protected options_: Options;

  // Aquí puedes inicializar el cliente de Openpay
  protected client: any;

  constructor({ logger }: InjectedDependencies, options: Options) {
    // @ts-ignore
    super(...arguments);

    this.logger_ = logger;
    this.options_ = options;

    // Inicializar el cliente de Openpay
    const Openpay = require('openpay');
    this.client = new Openpay(
      options.merchantId,
      options.apiKey,
      options.production,
    );
  }

  capturePayment(
    paymentData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    throw new Error('Method not implemented.');
  }
  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Promise<
    | PaymentProviderError
    | {
        status: PaymentSessionStatus;
        data: PaymentProviderSessionResponse['data'];
      }
  > {
    const externalId = paymentSessionData.id;

    try {
      const paymentData = await this.client.authorizePayment(externalId);
      console.log(paymentData, 'paymentData');
      return {
        data: {
          ...paymentData,
          id: externalId,
        },
        status: 'authorized',
      };
    } catch (e) {
      return {
        error: e,
        code: 'unknown',
        detail: e.message || e,
      };
    }
    // throw new Error('Method not implemented.');
  }
  cancelPayment(
    paymentData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    //return paymentData;
    throw new Error('Method not implemented.');
  }
  initiatePayment(
    context: CreatePaymentProviderSession,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    throw new Error('Method not implemented.');
  }
  deletePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    throw new Error('Method not implemented.');
  }
  getPaymentStatus(
    paymentSessionData: Record<string, unknown>,
  ): Promise<PaymentSessionStatus> {
    throw new Error('Method not implemented.');
  }
  refundPayment(
    paymentData: Record<string, unknown>,
    refundAmount: number,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    throw new Error('Method not implemented.');
  }
  retrievePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    throw new Error('Method not implemented.');
  }
  updatePayment(
    context: UpdatePaymentProviderSession,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    throw new Error('Method not implemented.');
  }
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload'],
  ): Promise<WebhookActionResult> {
    const { data, rawData } = payload as any;
    // data será el contenido del evento de Openpay
    console.log('data: ', data);
    console.log('rawData: ', rawData);
    try {
      // Supongamos que el webhook viene con un campo "type" y un "transaction" con "order_id" y "amount".
      const eventType = data.type;
      const transaction = data.transaction; // según la forma real del webhook
      switch (eventType) {
        case 'charge.succeeded':
          return {
            action: 'captured',
            data: {
              session_id: transaction.order_id, // Debes haber guardado order_id en session
              amount: transaction.amount, // Podrías necesitar BigNumber si lo requiere Medusa
            },
          };
        case 'charge.created':
          // Si llega este evento cuando se crea el cargo sin capturar
          return {
            action: 'authorized',
            data: {
              session_id: transaction.order_id,
              amount: transaction.amount,
            },
          };
        default:
          return {
            action: 'not_supported',
          };
      }
    } catch (e) {
      return {
        action: 'failed',
        data: {
          session_id: (data.metadata as Record<string, any>).session_id,
          amount: new BigNumber(data.amount as number),
        },
      };
    }

    throw new Error('Method not implemented.');
  }
}

export default OpenpayProviderService;

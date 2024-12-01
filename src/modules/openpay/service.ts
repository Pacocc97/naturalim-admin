import { AbstractPaymentProvider } from '@medusajs/framework/utils';
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
        detail: e,
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
  getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload'],
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload;

    console.log(data, 'data');
    console.log(rawData, 'rawData');
    console.log(headers, 'headers');

    // throw new Error('Method not implemented.');
  }
}

export default OpenpayProviderService;

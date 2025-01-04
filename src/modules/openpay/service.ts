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
import Openpay from 'openpay';
import { Transaction } from './types';

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
  protected client: Openpay;

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

  async initiatePayment(
    context: CreatePaymentProviderSession,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    // Ejemplo de log al inicio
    this.logger_.info('Iniciando initiatePayment en OpenpayProviderService');
    console.log('context', context);
    const { amount, currency_code, context: customerDetails } = context;
    // Podrías querer loguear datos relevantes (sólo si no contienen info sensible)
    this.logger_.debug(
      `initiatePayment -> amount: ${amount}, currency: ${currency_code}`,
    );
    try {
      // Aquí tu lógica...
      // ...
      this.logger_.info('initiatePayment completado exitosamente');
      return {
        data: {
          ...context,
        },
      };
    } catch (e) {
      this.logger_.error(`initiatePayment falló: ${e.message}`);
      return {
        error: e,
        code: 'unknown',
        detail: e,
      };
    }
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
    this.logger_.info('Iniciando authorizePayment en OpenpayProviderService');
    const externalId = paymentSessionData.id;

    this.logger_.debug(
      `authorizePayment -> externalId: ${externalId}, amount: ${context.amount}, currency_code: ${context.currency_code}`,
    );

    console.log('paymentSessionData', paymentSessionData);
    console.log('context', context);

    try {
      // Acceder correctamente a las propiedades de customer
      const customer =
        (context as any).customer || (context as any).user?.customer;

      if (!customer) {
        // Manejo de error si no se encuentra la información del cliente
        this.logger_.error(
          'Información del cliente no encontrada en el contexto.',
        );
        return {
          error: 'missing_customer',
          code: 'missing_customer',
          detail: 'No se encontró la información del cliente en el contexto.',
        };
      }
      const paymentData = await new Promise<Transaction>((resolve, reject) => {
        this.client.charges.create(
          {
            source_id: paymentSessionData.context.source_id,
            method: 'card',
            amount: context.amount,
            currency: context.currency_code,
            description: context.description,
            order_id: externalId,
            device_session_id: paymentSessionData.context.device_session_id,
            customer: {
              name: customer.name,
              last_name: customer.last_name,
              email: customer.email,
              phone_number: customer.phone_number,
            },
            capture: true,
            use_3d_secure: true,
            redirect_url: context.redirect_url + '&redirect_status=succeeded',
          },
          (error, charge: Transaction) => {
            if (error) {
              this.logger_.error(
                `Error al autorizar el pago: ${error.description}`,
              );
              reject({
                error,
                code: error.error_code || 'payment_failed',
                detail: error.description || 'Error al procesar el pago',
              });
            } else {
              this.logger_.info(
                `Pago autorizado correctamente: transactionId=${charge.id}`,
              );
              resolve(charge);
            }
          },
        );
      });

      this.logger_.info(
        `authorizePayment completado, paymentData=${paymentData.id}`,
      );
      return {
        data: {
          ...paymentData,
          id: externalId,
          transaction_id: paymentData.id,
        },
        status: 'authorized',
      };
    } catch (error) {
      this.logger_.error(
        `authorizePayment falló: ${error.detail || error.message}`,
      );
      return {
        error,
        code: error.code || 'unknown',
        detail: error.detail || error.message || 'Error al procesar el pago',
      };
    }
  }

  async capturePayment(
    paymentData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    try {
      const { payment_id } = paymentData;
    } catch (error) {
      return {};
      return {
        error,
        code: error.code || 'unknown',
        detail: error.detail || error.message || 'Error al confirmar el cargo',
      };
    }
  }

  cancelPayment(
    paymentData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    //return paymentData;
    throw new Error('Method not implemented.');
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse['data']> {
    const externalId = paymentSessionData.id;

    try {
      // assuming you have a client that cancels the payment
      await externalId;
    } catch (e) {
      return {
        error: e,
        code: 'unknown',
        detail: e,
      };
    }
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>,
  ): Promise<PaymentSessionStatus> {
    const externalId = paymentSessionData.id;
    console.log('paymentSessionData', paymentSessionData);
    return 'authorized';
    // throw new Error('Method not implemented.');
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
  async updatePayment(
    context: UpdatePaymentProviderSession,
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    try {
      // `paymentSessionData` es lo que ya tienes guardado
      const paymentSessionData = context.paymentSessionData || {};

      // Aquí obtienes los nuevos datos (ej. el token)
      const cardToken = context?.context?.card_token;

      // Retornas tu nueva data, mezclada con la anterior
      return {
        data: {
          ...paymentSessionData,
          card_token: cardToken,
        },
      };
    } catch (e) {
      return {
        error: e,
        code: 'unknown',
        detail: e,
      };
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload'],
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload;

    try {
      switch (data.event_type) {
        case 'authorized_amount':
          return {
            action: 'authorized',
            data: {
              session_id: (data.metadata as Record<string, any>).session_id,
              amount: new BigNumber(data.amount as number),
            },
          };
        case 'success':
          return {
            action: 'captured',
            data: {
              session_id: (data.metadata as Record<string, any>).session_id,
              amount: new BigNumber(data.amount as number),
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
  }
}

export default OpenpayProviderService;

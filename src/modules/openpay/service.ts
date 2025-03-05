import {
  AbstractPaymentProvider,
  BigNumber,
  MedusaError,
} from '@medusajs/framework/utils';
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  RefundPaymentInput,
  PaymentProviderOutput,
  Logger,
  PaymentProviderInput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
} from '@medusajs/framework/types';
import {
  PaymentSessionStatus,
  ProviderWebhookPayload,
  WebhookActionResult,
} from '@medusajs/framework/types';
import Openpay from 'openpay';
import { Transaction } from './types';
import {
  PaymentAccountHolderDTO,
  PaymentCustomerDTO,
} from '@medusajs/framework/types';

type InjectedDependencies = {
  logger: Logger;
};

type Options = {
  apiKey: string;
  merchantId: string;
  production: boolean;
};

export type PaymentProviderContext = {
  account_holder?: PaymentAccountHolderDTO;
  customer?: PaymentCustomerDTO;
  source_id: string;
  amount: number;
  currency_code: string;
  description: string;
  device_session_id: string;
  redirect_url: string;
};

class OpenpayProviderService extends AbstractPaymentProvider<Options> {
  static identifier = 'openpay';

  protected logger_: Logger;
  protected options_: Options;

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
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    function generateRandomId() {
      return '_' + Math.random().toString(36).substr(2, 9);
    }
    // Simulamos la respuesta, ya que no se necesita iniciar sesión de pago en Openpay
    const response = {
      id: generateRandomId(),
      // puedes incluir otros datos relevantes que necesites almacenar
    };

    return {
      id: response.id,
      data: response,
    };
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const context = input.context as PaymentProviderContext;
    this.logger_.info('Iniciando authorizePayment en OpenpayProviderService');
    console.log('context', context);

    try {
      // Accedemos a la información del cliente directamente desde el context
      const customer = context.customer ?? (context as any).user?.customer;
      if (!customer) {
        this.logger_.error(
          'Información del cliente no encontrada en el contexto.',
        );
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          'No se encontró la información del cliente en el contexto.',
        );
      }

      const paymentData = await new Promise<Transaction>((resolve, reject) => {
        this.client.charges.create(
          {
            source_id: context.source_id,
            method: 'card',
            amount: context.amount,
            currency: context.currency_code,
            description: context.description,
            order_id: input.data?.id || '',
            device_session_id: context.device_session_id,
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
          transaction_id: paymentData.id,
        },
        status: 'authorized',
      };
    } catch (error) {
      this.logger_.error(
        `authorizePayment falló: ${error.detail || error.message}`,
      );
      return {
        status: 'error',
        data: {
          error,
          code: error.code || 'unknown',
          detail: error.detail || error.message || 'Error al procesar el pago',
        },
      };
    }
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    const externalId = input.data?.id;
    try {
      return { data: input };
    } catch (error) {
      // Si se dispone de un logger, registra el error para facilitar su diagnóstico
      if (this.logger_) {
        this.logger_.error('Error al capturar el pago', error);
      }

      // Si el error ya es un MedusaError, re-lánzalo directamente
      if (error instanceof MedusaError) {
        throw error;
      }

      // Envolver errores desconocidos en un MedusaError con un tipo y código específico
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, // Tipo de error adecuado para fallos en el flujo de pago
        `Error al capturar el pago con ID externo ${externalId}: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
        'payment_capture_error', // Código de error personalizado (opcional)
      );
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    //return paymentData;
    throw new Error('Method not implemented.');
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const externalId = input.data?.id;
    this.logger_.info(
      `deletePayment called for externalId: ${externalId} (mockup)`,
    );
    // Como OpenPay no soporta la cancelación de pagos, simplemente retornamos un objeto vacío.
    return {};
  }

  async getPaymentStatus(
    input: PaymentProviderInput,
  ): Promise<{ status: PaymentSessionStatus }> {
    const externalId = input.data?.id;
    console.log('paymentData', input);
    return { status: 'authorized' };
  }

  async refundPayment(
    input: RefundPaymentInput,
  ): Promise<PaymentProviderOutput> {
    throw new Error('Method not implemented.');
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    throw new Error('Method not implemented.');
  }
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    throw new Error('Method not implemented.');
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

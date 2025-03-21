// src/modules/skydropx-fulfillment/service.ts
import {
  AbstractFulfillmentProviderService,
  MedusaError,
} from '@medusajs/framework/utils';

import {
  FulfillmentOption,
  CreateFulfillmentResult,
  FulfillmentItemDTO,
  FulfillmentOrderDTO,
  FulfillmentDTO,
  CalculateShippingOptionPriceDTO,
  CalculatedShippingOptionPrice,
  CreateShippingOptionDTO,
} from '@medusajs/framework/types';

import { Logger } from '@medusajs/framework/types';

import { SkyDropxClient, SkyDropxAuthOptions } from './client';

/**
 * Dependencias que inyecta Medusa en el constructor (opcional, aquí ejemplificamos logger).
 */
type InjectedDependencies = {
  logger: Logger;
};

/**
 * Opciones que pasamos al registrar el provider (client_id, client_secret, etc.)
 */
type SkyDropxProviderOptions = SkyDropxAuthOptions & {
  // Otros campos que quieras exponer como config
  printing_format?: 'standard' | 'thermal';
};

/**
 * Ejemplo de Fulfillment Provider para Skydropx
 */
class SkyDropxFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = 'skydropx-fulfillment';

  protected logger_: Logger;
  protected options_: SkyDropxProviderOptions;
  protected client: SkyDropxClient;

  constructor(
    { logger }: InjectedDependencies,
    options: SkyDropxProviderOptions,
  ) {
    super();
    this.logger_ = logger;
    this.options_ = options;

    // Creamos el cliente de Skydropx
    this.client = new SkyDropxClient({
      client_id: this.options_.client_id,
      client_secret: this.options_.client_secret,
    });
  }

  /**
   * getFulfillmentOptions() -> retorna las opciones/carriers
   * que quieras exponer en Medusa.
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    // Si Skydropx no da un endpoint con "services",
    // sólo regresas 1 o más de forma estática.
    return [
      {
        id: 'skydropx-default',
        name: 'Skydropx Default Shipping',
      },
    ];
  }

  /**
   * validateFulfillmentData -> si deseas procesar/almacenar
   * data extra en shipping methods
   */
  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any,
  ): Promise<any> {
    // Podrías, por ejemplo, hacer una cotización previa
    // y guardar un "quotation_id" para usarlo después.
    // Ejemplo trivial: retorna data sin cambios
    return data;
  }

  /**
   * Validar la data de la shipping option
   */
  async validateOption(data: any): Promise<boolean> {
    this.logger_.info(
      '[SkydropxFulfillmentProviderService] validateOption llamado',
    );

    // Ejemplo de validación
    if (!data) {
      this.logger_.warn('Data de shipping option está vacío, ignorando.');
      return false;
    }
    // Solo un chequeo simple
    return true;
  }

  /**
   * Indica si podemos calcular la tarifa con los datos del shipping option.
   */
  async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
    this.logger_.info(
      '[SkydropxFulfillmentProviderService] canCalculate llamado',
    );

    // En este ejemplo regresamos false (tarifa fija)
    return false;
  }

  /**
   * calculatePrice -> si canCalculate() retorna true,
   * aquí harías la lógica de calcular la tarifa.
   */
  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO['optionData'],
    data: CalculateShippingOptionPriceDTO['data'],
    context: CalculateShippingOptionPriceDTO['context'],
  ): Promise<CalculatedShippingOptionPrice> {
    // Como dijimos canCalculate es false, no se ejecutaría,
    // pero si lo necesitaras, harías algo como:
    // const amount = await this.client.getLiveRate(context)
    return {
      calculated_amount: 150,
      is_calculated_price_tax_inclusive: true,
    };
  }

  /**
   * createFulfillment -> Llamado cuando creas un fulfillment en Medusa.
   * Aquí es donde llamas a Skydropx para generar la guía.
   */
  async createFulfillment(
    methodData: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, 'fulfillment'>>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<
      Omit<FulfillmentDTO, 'provider_id' | 'data' | 'items'>
    >,
  ): Promise<CreateFulfillmentResult> {
    this.logger_.info(
      '[SkydropxFulfillmentProviderService] createFulfillment llamado',
    );

    try {
      // Revisa si hay data (por ejemplo un "quotation_id" o algo)
      this.logger_.debug(
        `Fulfillment method data: ${JSON.stringify(methodData)}`,
      );
      this.logger_.debug(`Fulfillment items: ${JSON.stringify(items)}`);
      this.logger_.debug(`Order details: ${JSON.stringify(order)}`);

      // 1. Estructura el payload
      const shipmentPayload = {
        quotation: {
          address_from: {
            country_code: 'MX',
            postal_code: '45070',
            area_level1: 'Jalisco',
            area_level2: 'Zapopan',
            area_level3: 'La Calma',
            street1: 'Prol. Av. López Mateos Sur 4900',
            name: 'Naturalim S de RL de CV',
            company: 'NAT110111I95',
            phone: '523330036489',
            email: 'administracion@naturalim.com.mx',
            reference: 'Piso 2. Arriba agencia Italika',
          },
          address_to: {
            country_code: 'MX',
            postal_code: '45136',
            area_level1: 'Jalisco',
            area_level2: 'Zapopan',
            area_level3: 'Jardín Real',
            street1: 'Jardín de las victorias Norte 153',
            name: 'Francisco Cota Castro',
            company: '',
            phone: '523334658587',
            email: 'pacocc97@gmail.com',
            reference: 'Esquina del parque',
          },
          parcel: {
            length: 10,
            width: 10,
            height: 10,
            weight: 2.0, // en kg
          },
        },
      };

      // 2. Llama a la API de Skydropx
      this.logger_.info(
        '[SkydropxFulfillmentProviderService] Llamando createShipment...',
      );
      const shipmentResult = await this.client.createQuotation(shipmentPayload);

      // 3. Extrae data
      const shipmentId = shipmentResult?.ƒ?.id;
      const trackingNumber =
        shipmentResult.data?.attributes?.master_tracking_number;

      this.logger_.info(
        `[SkydropxFulfillmentProviderService] Shipment creado con ID ${shipmentId}, tracking: ${trackingNumber}`,
      );

      // 4. Devuelve data para guardarse en fulfillment.data
      return {
        data: {
          shipment_id: shipmentId,
          tracking_number: trackingNumber,
        },
        labels: [],
      };
    } catch (error: any) {
      // Manejo de errores con logs
      this.logger_.error(
        `[SkydropxFulfillmentProviderService] Error en createFulfillment: ${error?.message}`,
      );
      // Lanza un error que Medusa reconocerá
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Skydropx createFulfillment error: ${error.message}`,
      );
    }
  }

  /**
   * cancelFulfillment -> Llamado cuando se cancela un fulfillment en Medusa.
   */
  async cancelFulfillment(
    fulfillmentData: Record<string, unknown>,
  ): Promise<any> {
    this.logger_.info(
      '[SkydropxFulfillmentProviderService] cancelFulfillment llamado',
    );

    try {
      // recupera shipment_id
      const shipmentId = fulfillmentData?.shipment_id as string;
      if (!shipmentId) {
        this.logger_.warn('No se encontró shipment_id en fulfillment.data');
        throw new Error('No shipment_id found');
      }

      // Llamada a la API
      this.logger_.info(
        `[SkydropxFulfillmentProviderService] Cancelando shipment ${shipmentId}`,
      );
      await this.client.cancelShipment(shipmentId, 'Cancelado desde Medusa');

      this.logger_.info(
        `[SkydropxFulfillmentProviderService] Shipment ${shipmentId} cancelado correctamente`,
      );
      return {};
    } catch (error: any) {
      this.logger_.error(
        `[SkydropxFulfillmentProviderService] Error en cancelFulfillment: ${error.message}`,
      );
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Skydropx cancelFulfillment error: ${error.message}`,
      );
    }
  }

  /**
   * getFulfillmentDocuments -> si tu cliente retorna PDFs o documentos.
   */
  async getFulfillmentDocuments(
    data: Record<string, unknown>,
  ): Promise<never[]> {
    // Por simplicidad retorna vacío
    return [];
  }

  /**
   * createReturnFulfillment -> Llamado cuando se crea un fulfillment para un RETURN
   */
  async createReturnFulfillment(
    fulfillment: Record<string, unknown>,
  ): Promise<CreateFulfillmentResult> {
    // Podrías llamar a un endpoint de "envío de retorno" en Skydropx
    return { data: {}, labels: [] };
  }

  /**
   * getReturnDocuments -> Obtener docs de un retorno.
   */
  async getReturnDocuments(data: any): Promise<never[]> {
    return [];
  }

  /**
   * getShipmentDocuments -> Obtener docs de un envío
   */
  async getShipmentDocuments(data: any): Promise<never[]> {
    return [];
  }

  /**
   * retrieveDocuments -> obtener documentos con cierto tipo
   */
  async retrieveDocuments(
    fulfillmentData: any,
    documentType: any,
  ): Promise<void> {
    // Ejemplo trivial
    return;
  }
}

export default SkyDropxFulfillmentProviderService;

// async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
//   return [
//     {
//       id: 'skydropx-option',
//       name: 'Skydropx Shipping',
//     },
//   ];
// }

// // Ejemplo: si quieres usar la cotización en canCalculate
// async canCalculate(data: any): Promise<boolean> {
//   try {
//     // Armas tu payload para "quotation"
//     // Mira la doc: { "quotation": {...}}
//     const quotationPayload = {
//       quotation: {
//         address_from: {
//           country_code: 'MX',
//           postal_code: '45070',
//           area_level1: 'Jalisco',
//           area_level2: 'Zapopan',
//           area_level3: 'La Calma',
//           street1: 'Prol. Av. López Mateos Sur 4900',
//           name: 'Naturalim S. de R.L. de C.V.',
//           company: 'NAT110111I95',
//           phone: '523330036489',
//           email: 'administracion@naturalim.com.mx',
//           reference: 'Piso 2. Arriba agencia Italika',
//         },
//         address_to: {
//           country_code: 'MX',
//           postal_code: '45136',
//           area_level1: 'Jalisco',
//           area_level2: 'Zapopan',
//           area_level3: 'Jardín Real',
//           street1: 'Jardín de las victorias Norte 153',
//           name: 'Francisco Cota Castro',
//           company: '',
//           phone: '523334658587',
//           email: 'pacocc97@gmail.com',
//           reference: 'Esquina del parque',
//         },
//         parcel: {
//           length: 10,
//           width: 10,
//           height: 10,
//           weight: 2.0, // en kg
//         },
//         // Otras propiedades como order_id, requested_carriers, etc. si lo requieres
//       },
//     };

//     // Llamada a SkydropxClient
//     const quotationResult =
//       await this.client.createQuotation(quotationPayload);
//     console.log('Quotation: ', quotationResult);
//     // Con "quotationResult" puedes revisar si te conviene la tarifa.
//     // Por ahora, si la obtienes con éxito, retórnalo
//     return true;
//   } catch (error) {
//     // Si falla, devuelves false
//     return false;
//   }
// }

// async createFulfillment(
//   data: Record<string, unknown>,
//   items: Partial<Omit<FulfillmentItemDTO, 'fulfillment'>>[],
//   order: Partial<FulfillmentOrderDTO> | undefined,
//   fulfillment: Partial<
//     Omit<FulfillmentDTO, 'provider_id' | 'data' | 'items'>
//   >,
// ): Promise<CreateFulfillmentResult> {
//   // Llamas a createShipment con la data adecuada
//   const shipmentPayload = {
//     shipment: {
//       // Ajusta con la doc
//     },
//   };

//   const shipmentResult = await this.client.createShipment(shipmentPayload);
//   const shipmentId = shipmentResult.data?.id;
//   const trackingNumber =
//     shipmentResult.data?.attributes?.master_tracking_number;

//   return {
//     data: {
//       shipment_id: shipmentId,
//       tracking_number: trackingNumber,
//     },
//     labels: [],
//   };
// }

// async cancelFulfillment(data: Record<string, unknown>): Promise<any> {
//   // const shipmentId = fulfillment.data.shipment_id;
//   // if (!shipmentId) {
//   //   throw new Error('No se encontró el shipment_id para cancelación.');
//   // }
//   // return this.client.cancelShipment(shipmentId, 'Se canceló el envío');
//   throw new Error('No implementado');
// }

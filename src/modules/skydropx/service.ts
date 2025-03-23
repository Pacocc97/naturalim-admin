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
   * =========================================================================
   *    *** LISTA DE PAQUETES COMPLETOS ***
   * =========================================================================
   * A continuación definimos todos los paquetes con su estructura.
   * Ajusta 'quantity', 'weight', 'dimensions', etc. según tus necesidades.
   */
  private PACKAGE_OPTIONS = {
    // Nombre interno -> Objeto con la estructura Skydropx
    p15frascosCaja08: {
      name: '15 frascos caja 08 (25.0 x 16.0 x 16.0 cm 2.0 kg)',
      weight: 2.0,
      length: 25.0,
      width: 16.0,
      height: 16.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    p20: {
      name: '20 (25.0 x 16.0 x 16.0 cm 2.0 kg)',
      weight: 2.0,
      length: 25.0,
      width: 16.0,
      height: 16.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    p20frascos: {
      name: '20 frascos (30.0 x 15.0 x 20.0 cm 2.0 kg)',
      weight: 2.0,
      length: 30.0,
      width: 15.0,
      height: 20.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    sobreNormal: {
      name: 'Sobre normal (30.0 x 23.0 x 5.0 cm 1.0 kg)',
      weight: 1.0,
      length: 30.0,
      width: 23.0,
      height: 5.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Sobre',
      consignment_note: 'CP123456789',
    },
    caja10: {
      name: 'caja 10 (30.0 x 25.0 x 10.0 cm 5.0 kg)',
      weight: 5.0,
      length: 30.0,
      width: 25.0,
      height: 10.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    cajaOme: {
      name: 'caja ome (45.0 x 30.0 x 15.0 cm 5.0 kg)',
      weight: 5.0,
      length: 45.0,
      width: 30.0,
      height: 15.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    grande180: {
      name: 'grande 180 (68.0 x 36.0 x 31.0 cm 12.0 kg)',
      weight: 12.0,
      length: 68.0,
      width: 36.0,
      height: 31.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    neptune: {
      name: 'neptune (32.0 x 25.0 x 26.0 cm 4.0 kg)',
      weight: 4.0,
      length: 32.0,
      width: 25.0,
      height: 26.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
    omega: {
      name: 'omega (29.7 x 5.0 x 21.0 cm 0.5 kg)',
      weight: 0.5,
      length: 29.7,
      width: 5.0,
      height: 21.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Sobre',
      consignment_note: 'CP123456789',
    },
    sobre: {
      name: 'sobre (29.7 x 5.0 x 21.0 cm 0.5 kg)',
      weight: 0.5,
      length: 29.7,
      width: 5.0,
      height: 21.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Sobre',
      consignment_note: 'CP123456789',
    },
    ome100: {
      name: '100 ome (68.0 x 23.0 x 25.0 cm 8.0 kg)',
      weight: 8.0,
      length: 68.0,
      width: 23.0,
      height: 25.0,
      quantity: 1,
      dimension_unit: 'cm',
      mass_unit: 'kg',
      package_type: 'Caja',
      consignment_note: 'CP123456789',
    },
  };

  /**
   * =========================================================================
   *      *** FUNCIÓN PARA SELECCIONAR PARCEL SEGÚN LA CANTIDAD ***
   * =========================================================================
   * Ajusta los rangos de cantidad de frascos (o items) según la lógica
   * que te comentó Margarita en la conversación.
   */
  private getParcelByQuantity(qty: number) {
    // Ejemplo de lógica (puedes cambiarla a tu gusto):
    //  1 - 12 => "sobre"
    // 13 - 19 => "caja10"
    // 20 - 44 => "cajaOme"
    // 45 - 99 => "grande180"
    // >= 100  => "ome100"

    if (qty <= 12) {
      return this.PACKAGE_OPTIONS.sobre;
    } else if (qty <= 19) {
      return this.PACKAGE_OPTIONS.caja10;
    } else if (qty <= 44) {
      return this.PACKAGE_OPTIONS.cajaOme;
    } else if (qty <= 99) {
      return this.PACKAGE_OPTIONS.grande180;
    } else {
      return this.PACKAGE_OPTIONS.ome100;
    }
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

      // 1. Calculamos la cantidad total de frascos (o items) en la orden
      let totalQuantity = 0;
      order?.items?.forEach((i) => {
        totalQuantity += i.quantity ?? 0;
      });

      // 2. Escoger el "parcel" según la cantidad
      const selectedParcel = this.getParcelByQuantity(totalQuantity);

      // 1. Mapea tus items a 'products'
      const products = order?.items?.map((item: any) => ({
        name: item.title ?? 'Producto genérico',
        hs_code: '', // código para exportación
        sku: item.variant_sku ?? '',
        price: item.unit_price ? item.unit_price.toString() : '0.00',
        quantity: item.quantity ?? 1,
        weight: item.variant?.weight ?? 0.2,
        height: item.variant?.height ?? 20,
        length: item.variant?.length ?? 20,
        width: item.variant?.width ?? 15,
      }));

      // 2. Crea array 'parcels'
      // const parcels = [
      //   {
      //     name: '15 frascos caja 08',
      //     weight: 2.0,
      //     length: 25.0,
      //     width: 16.0,
      //     height: 16.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: '20 (25.0 x 16.0 x 16.0 cm 2.0 kg)',
      //     weight: 2.0,
      //     length: 25.0,
      //     width: 16.0,
      //     height: 16.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: '20 frascos',
      //     weight: 2.0,
      //     length: 30.0,
      //     width: 15.0,
      //     height: 20.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'Sobre normal',
      //     weight: 1.0,
      //     length: 30.0,
      //     width: 23.0,
      //     height: 5.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Sobre',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'caja 10',
      //     weight: 5.0,
      //     length: 30.0,
      //     width: 25.0,
      //     height: 10.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'caja ome',
      //     weight: 5.0,
      //     length: 45.0,
      //     width: 30.0,
      //     height: 15.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'grande 180',
      //     weight: 12.0,
      //     length: 68.0,
      //     width: 36.0,
      //     height: 31.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'neptune',
      //     weight: 4.0,
      //     length: 32.0,
      //     width: 25.0,
      //     height: 26.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Caja',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'omega',
      //     weight: 0.5,
      //     length: 29.7,
      //     width: 5.0,
      //     height: 21.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Sobre',
      //     consignment_note: 'CP123456789',
      //   },
      //   {
      //     name: 'sobre',
      //     weight: 0.5,
      //     length: 29.7,
      //     width: 5.0,
      //     height: 21.0,
      //     quantity: 1,
      //     dimension_unit: 'cm',
      //     mass_unit: 'kg',
      //     package_type: 'Sobre',
      //     consignment_note: 'CP123456789',
      //   },
      //   // {
      //   //   weight: 10.0,
      //   //   length: 40,
      //   //   width: 30,
      //   //   height: 10,
      //   //   quantity: 2,
      //   //   dimension_unit: 'cm',
      //   //   mass_unit: 'kg',
      //   //   package_type: 'Caja',
      //   //   consignment_note: 'CP123456789',
      //   // },
      // ];

      // 3. 'recipient_address' usando order.shipping_address
      const shipping = order?.shipping_address;
      const recipient_address = {
        address: shipping?.address_1 || '',
        internal_number: shipping?.address_2 || '',
        reference: shipping?.metadata?.reference ?? '',
        sector: shipping?.province || '',
        city: shipping?.city || '',
        state: shipping?.province || '',
        postal_code: shipping?.postal_code || '',
        country: shipping?.country_code?.toUpperCase() || 'MX',
        person_name:
          `${shipping?.first_name ?? ''} ${shipping?.last_name ?? ''}`.trim(),
        company: shipping?.company || '',
        phone: shipping?.phone || '',
        email: order?.email || 'sin_correo@medusa.com',
      };

      // 4. 'shipper_address' fijo o desde tu config
      const shipper_address = {
        address: 'Av. Adolfo López Mateos Sur 4900',
        internal_number: '',
        reference: 'Arriba de la agencia Italika',
        sector: 'La Calma',
        city: 'Zapopan',
        state: 'Jalisco',
        postal_code: '45080',
        country: 'MX',
        person_name: 'Juan Enrique Quiroz',
        company: 'Naturalim',
        phone: '5551234567',
        email: 'administracion@naturalim.com.mx',
      };

      // 5. Armar payload final
      const createOrderPayload = {
        order: {
          reference: order?.id ?? 'sin_ref',
          reference_number: order?.id
            ? `${order?.id}-${Date.now()}`
            : 'xxxx-1234',
          payment_status: 'paid', // o "pending", depende
          total_price: order?.total
            ? (Number(order.total) / 100).toFixed(2)
            : '0.00',
          merchant_store_id: '139539AS',
          headquarter_id: '468b8926-8e9d-4a62-baed-0cab7a3125f5',
          platform: 'web',
          package_type: '4G',
          parcels: [selectedParcel], // <= Importante
          products,
          shipper_address,
          recipient_address,
        },
      };

      this.logger_.info(
        '[SkydropxFulfillmentProviderService] Llamando createShipment...',
      );

      // 6. Llamar a tu cliente/SDK
      const shipmentResult = await this.client.createOrder(createOrderPayload);

      // 7. Extraer ID y número de rastreo (trackingNumber)
      const shipmentId = shipmentResult?.ƒ?.id;
      const trackingNumber =
        shipmentResult.data?.attributes?.master_tracking_number;

      this.logger_.info(
        `[SkydropxFulfillmentProviderService] Shipment creado con ID ${shipmentId}, tracking: ${trackingNumber}`,
      );

      // Devuelve data para guardarse en fulfillment.data
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

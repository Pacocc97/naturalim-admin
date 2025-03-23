import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';

export default async function orderFulfillmentHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  // Get the order data you need for fulfillment
  // For example, you might need to fetch the order first

  // Use the fulfillment module with your SkyDropx provider
  // await fulfillmentModuleService
  //   .createFulfillment({
  //     location_id: 'loc_123',
  //     provider_id: 'skydropx-fulfillment',
  //     delivery_address: {
  //       address_1: '4120 Auto Park Cir',
  //       country_code: 'us',
  //     },
  //     items: [
  //       {
  //         title: 'Shirt',
  //         sku: 'SHIRT',
  //         quantity: 1,
  //         barcode: 'ABCED',
  //       },
  //     ],
  //     labels: [
  //       {
  //         tracking_number: '1234567',
  //         tracking_url: 'https://example.com/tracking',
  //         label_url: 'https://example.com/label',
  //       },
  //     ],
  //     order: {},
  //   })
  //   .then((fulfillment) => {
  //     // Do something with the fulfillment
  //     console.log('fulfillment', fulfillment);
  //   })
  //   .catch((error) => {
  //     // Handle the error
  //     console.log('error', error);
  //   });
}

export const config: SubscriberConfig = {
  event: 'order.placed', // Or any other event that triggers fulfillment
};

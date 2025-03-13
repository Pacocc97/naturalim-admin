// src/subscribers/test-order-placed.ts
import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';

export default async function testMultipleEventsHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve('logger');
  logger.info(`EVENT DETECTED: ${event.name} with data:`);
  console.log(`EVENT DETECTED: ${event.name} with data:`, event.data);
}

export const config: SubscriberConfig = {
  event: [
    'product.created',
    'user.created',
    'user.updated',
    'order.placed',
    'order.updated',
    'order.completed',
    'order.refunded',
    'order.canceled',
    'order.fulfilled',
    'payment.captured',
    'cart.created',
    'cart.updated',
    'delivery.created',
    'shipment.created',
  ],
};

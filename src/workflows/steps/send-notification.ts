import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { CreateNotificationDTO } from '@medusajs/framework/types';

export const sendNotificationStep = createStep(
  'send-notification',
  async (data: CreateNotificationDTO[], { container }) => {
    console.log('Llamando al Notification Module con ID:', data);
    const notificationModuleService = container.resolve(Modules.NOTIFICATION);
    const notification =
      await notificationModuleService.createNotifications(data);
    return new StepResponse(notification);
  },
);

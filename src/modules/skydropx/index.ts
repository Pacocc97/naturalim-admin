// src/modules/skydropx-fulfillment/index.ts

import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import SkyDropxFulfillmentProviderService from './service';

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [SkyDropxFulfillmentProviderService],
});

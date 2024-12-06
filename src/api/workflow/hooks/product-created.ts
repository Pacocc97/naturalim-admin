import { StepResponse } from '@medusajs/framework/workflows-sdk';
import { createProductsWorkflow } from '@medusajs/medusa/core-flows';
import { Modules } from '@medusajs/framework/utils';

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {

    const productModuleService = container.resolve(Modules.PRODUCT);

    await productModuleService.upsertProducts(
      products.map((product) => ({
        ...product,
        metadata: {
          ...product.metadata,
        },
      })),
    );

    return new StepResponse(products, {
      products,
      additional_data,
    });
  },
  async ({ products, additional_data }, { container }) => {

    const productModuleService = container.resolve(Modules.PRODUCT);

    await productModuleService.upsertProducts(products);
  },
);

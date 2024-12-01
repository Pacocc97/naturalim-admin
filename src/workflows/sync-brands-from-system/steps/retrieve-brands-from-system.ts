import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import BrandModuleService from "../../../modules/brand/service";
import { BRAND_MODULE } from "../../../modules/brand";

export const retrieveBrandsFromSystemStep = createStep(
  "retrieve-brands-from-system",
  async (_, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    const brands = await brandModuleService.client.retrieveBrands();

    return new StepResponse(brands);
  }
);

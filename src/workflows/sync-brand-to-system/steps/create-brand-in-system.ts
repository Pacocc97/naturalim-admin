import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { SyncBrandToSystemInput } from "..";
import BrandModuleService from "../../../modules/brand/service";
import { BRAND_MODULE } from "../../../modules/brand";

export const createBrandInSystemStep = createStep(
  "create-brand-in-system",
  async ({ id }: SyncBrandToSystemInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    const brand = await brandModuleService.retrieveBrand(id);

    await brandModuleService.client.createBrand(brand);

    return new StepResponse(null, brand.id);
  },
  async (id, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    await brandModuleService.client.deleteBrand(id);
  }
);

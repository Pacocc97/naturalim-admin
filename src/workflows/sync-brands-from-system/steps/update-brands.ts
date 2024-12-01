import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import BrandModuleService from "../../../modules/brand/service";
import { BRAND_MODULE } from "../../../modules/brand";
import { Brand } from "../../../modules/brand/models/brand";

type UpdateBrandsInput = {
  brands: InferTypeOf<typeof Brand>[];
};

export const updateBrandsStep = createStep(
  "update-brand-step",
  async ({ brands }: UpdateBrandsInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    const prevUpdatedBrands = await brandModuleService.listBrands({
      id: brands.map((brand) => brand.id),
    });

    const updatedBrands = await brandModuleService.updateBrands(brands);

    return new StepResponse(updatedBrands, prevUpdatedBrands);
  },
  async (prevUpdatedBrands, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    await brandModuleService.updateBrands(prevUpdatedBrands);
  }
);

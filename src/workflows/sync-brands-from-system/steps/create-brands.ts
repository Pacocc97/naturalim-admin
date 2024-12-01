import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import BrandModuleService from "../../../modules/brand/service";
import { BRAND_MODULE } from "../../../modules/brand";
import { Brand } from "../../../modules/brand/models/brand";

type CreateBrandsInput = {
  brands: InferTypeOf<typeof Brand>[];
};

export const createBrandsStep = createStep(
  "create-brand-step",
  async (input: CreateBrandsInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    const brands = await brandModuleService.createBrands(input.brands);

    return new StepResponse(
      brands,
      brands.map((brand) => brand.id)
    );
  },
  async (ids: string[], { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    await brandModuleService.deleteBrands(ids);
  }
);

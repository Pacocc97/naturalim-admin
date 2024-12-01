import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { InferTypeOf } from "@medusajs/framework/types";
import { retrieveBrandsFromSystemStep } from "./steps/retrieve-brands-from-system";
import { createBrandsStep } from "./steps/create-brands";
import { updateBrandsStep } from "./steps/update-brands";
import { Brand } from "../../modules/brand/models/brand";

export const syncBrandsFromSystemWorkflow = createWorkflow(
  "sync-brands-from-system",
  () => {
    const brands = retrieveBrandsFromSystemStep();

    const { toCreate, toUpdate } = transform(
      {
        brands,
      },
      (data) => {
        const toCreate: InferTypeOf<typeof Brand>[] = [];
        const toUpdate: InferTypeOf<typeof Brand>[] = [];

        data.brands.forEach((brand) => {
          if (brand.external_id) {
            toUpdate.push({
              ...brand,
              id: brand.external_id,
            });
          } else {
            toCreate.push(brand);
          }
        });

        return { toCreate, toUpdate };
      }
    );

    const created = createBrandsStep({ brands: toCreate });
    const updated = updateBrandsStep({ brands: toUpdate });

    return new WorkflowResponse({
      created,
      updated,
    });
  }
);

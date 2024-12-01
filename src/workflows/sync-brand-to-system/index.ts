import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createBrandInSystemStep } from "./steps/create-brand-in-system";

export type SyncBrandToSystemInput = {
  id: string;
};

export const syncBrandToSystemWorkflow = createWorkflow(
  "sync-brand-to-system",
  (input: SyncBrandToSystemInput) => {
    createBrandInSystemStep(input);

    return new WorkflowResponse(undefined);
  }
);

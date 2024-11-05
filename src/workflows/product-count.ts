import { Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";
import {
    createStep,
    createWorkflow,
    StepResponse,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk";
  
  const step1 = createStep("step-1", async (_, context) => {
    const productModuleService: IProductModuleService = context.container.resolve(Modules.PRODUCT)

    const[, count] = await productModuleService.listAndCountProducts()
    
    return new StepResponse(count);
  });
  
  
  const myWorkflow = createWorkflow(
    "product-count",
    function () {
      const count = step1();
  
      return new WorkflowResponse({
        count,
      });
    }
  );
  
  export default myWorkflow;
  
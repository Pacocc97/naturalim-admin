import { Modules } from "@medusajs/framework/utils";
import {
  IProductModuleService,
  MedusaContainer,
} from "@medusajs/framework/types";

export default async function myCustomJob(container: MedusaContainer) {
  const productModuleService: IProductModuleService = container.resolve(
    Modules.PRODUCT
  );

  const [, count] = await productModuleService.listAndCountProducts();

  console.log(`Time to checl products! You have ${count} product(s)`);
}

export const config = {
  name: "every-minute-message",
  // execute every minute
  schedule: "* * * * *",
};
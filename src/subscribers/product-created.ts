import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

// suscriber function
export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productModuleService: IProductModuleService = container.resolve(
    Modules.PRODUCT
  );

  const productId = data.id;

  const product = await productModuleService.retrieveProduct(productId);

  console.log(`The product ${product.title} was created`);
}

// suscriber config
export const config: SubscriberConfig = {
  event: "product.created",
};

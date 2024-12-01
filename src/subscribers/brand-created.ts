import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { syncBrandToSystemWorkflow } from "../workflows/sync-brand-to-system";

export default async function brandCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncBrandToSystemWorkflow(container).run({
    input: data,
  });
}

export const config: SubscriberConfig = {
  event: "brand.created",
};

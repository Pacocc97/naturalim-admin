import { MedusaContainer } from "@medusajs/framework/types";
import { syncBrandsFromSystemWorkflow } from "../workflows/sync-brands-from-system";

export default async function (container: MedusaContainer) {
  const logger = container.resolve("logger");

  const { result } = await syncBrandsFromSystemWorkflow(container).run();

  logger.info(
    `Synced brands from third-party system: ${result.created.length} brands created and ${result.updated.length} brands updated.`
  );
}

export const config = {
  name: "sync-brands-from-system",
  schedule: "* * * * *",
};

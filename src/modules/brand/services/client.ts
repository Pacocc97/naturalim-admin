import { Logger, ConfigModule } from "@medusajs/framework/types";
import { BRAND_MODULE } from "..";
import { InferTypeOf } from "@medusajs/framework/types"
import { Brand } from "../models/brand"


export type BrandClientOptions = {
  apiKey: string;
};

type InjectedDependencies = {
  logger: Logger;
  configModule: ConfigModule;
};

export class BrandClient {
  private options_: BrandClientOptions;
  private logger_: Logger;

  constructor({ logger, configModule }: InjectedDependencies) {
    this.logger_ = logger;

    const moduleDef = configModule.modules[BRAND_MODULE];
    if (typeof moduleDef !== "boolean") {
      this.options_ = moduleDef.options as BrandClientOptions;
    }
  }

  // a dummy method to simulate sending a request,
  // in a realistic scenario, you'd use an SDK, fetch, or axios clients
  private async sendRequest(url: string, method: string, data?: any) {
    this.logger_.info(
      `Sending a ${method} request to ${url}. data: ${JSON.stringify(
        data,
        null,
        2
      )}`
    );
    this.logger_.info(
      `Client Options: ${JSON.stringify(this.options_, null, 2)}`
    );
  }

  async createBrand(brand: InferTypeOf<typeof Brand>) {
    await this.sendRequest("/brands", "POST", brand);
  }

  async deleteBrand(id: string) {
    await this.sendRequest(`/brands/${id}`, "DELETE");
  }

  async retrieveBrands() {
    await this.sendRequest("/brands", "GET");

    return [];
  }
}

import { MedusaService } from "@medusajs/framework/utils";
import MyCustom from "./models/my-custom";
import { ClientService } from "./services";

// recommended to define type in another file
type ModuleOptions = {
  capitalize?: boolean
}

type InjectedDependencies = {
  clientService: ClientService
}


export default class HelloModuleService extends MedusaService({
  MyCustom,
}){
  protected options_: ModuleOptions
  protected clientService_: ClientService

  // constructor({}, options?: ModuleOptions) {
    // this.options_ = options || {
    //   capitalize: false,
    // }
    constructor({ clientService }: InjectedDependencies) {
    super(...arguments)
    this.clientService_ = clientService
  }

  // ...
}
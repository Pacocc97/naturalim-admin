import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICustomerModuleService } from "@medusajs/framework/types"

// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   if (req.auth_context?.actor_id) {
//     // retrieve customer
//     const customerModuleService: ICustomerModuleService = req.scope.resolve(
//       Modules.CUSTOMER
//     )

//     const customer = await customerModuleService.retrieveCustomer(
//       req.auth_context.actor_id
//     )
//   }

//   // ...
// }

export const GET = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.json({
    message: "[GET] Hello world!",
  })
}

export const CORS = false
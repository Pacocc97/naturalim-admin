import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IUserModuleService } from "@medusajs/framework/types"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const userModuleService: IUserModuleService = req.scope.resolve(
    Modules.USER
  )

  const user = await userModuleService.retrieveUser(
    req.auth_context.actor_id
  )

  // ...
}
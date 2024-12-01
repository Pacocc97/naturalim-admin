import { z } from "zod"

export const PostStoreCustomSchema = z.object({
  a: z.number(),
  b: z.number(),
})
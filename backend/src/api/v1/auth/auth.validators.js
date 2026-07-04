import { z } from '../../../core/validation/zod-openapi.js'

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .openapi('LoginBody')

import { z } from '../../../core/validation/zod-openapi.js'

export const createVpsUserSchema = z
  .object({
    customerName: z.string().trim().min(1).max(120),
    customerEmail: z.string().email(),
    customerPhone: z.string().max(30).optional(),
    notes: z.string().max(2000).optional(),
  })
  .openapi('CreateVpsUserBody')

export const updateVpsUserSchema = z
  .object({
    customerName: z.string().trim().min(1).max(120).optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().max(30).optional(),
    notes: z.string().max(2000).optional(),
  })
  .openapi('UpdateVpsUserBody')

export const vpsUserQuerySchema = z.object({
  search: z.string().optional(),
})

import { z } from '../../../core/validation/zod-openapi.js'

const availabilityStatuses = ['available', 'shared']
const pingStatuses = ['online', 'offline', 'unknown']

const credentialsSchema = z.object({
  username: z.string().trim().max(120).optional(),
  password: z.string().trim().max(200).optional(),
  panelUrl: z.string().trim().max(500).optional(),
  additionalNotes: z.string().max(2000).optional(),
})

export const createVpsServerSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    serverDetails: z.string().trim().min(1),
    ip: z.string().trim().min(1).max(120),
    credentials: credentialsSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .openapi('CreateVpsServerBody')

export const updateVpsServerSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    serverDetails: z.string().trim().min(1).optional(),
    ip: z.string().trim().min(1).max(120).optional(),
    credentials: credentialsSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .openapi('UpdateVpsServerBody')

export const updateAvailabilityStatusSchema = z
  .object({
    availabilityStatus: z.enum(availabilityStatuses),
  })
  .openapi('UpdateVpsServerAvailabilityBody')

export const vpsServerQuerySchema = z.object({
  availabilityStatus: z.enum(availabilityStatuses).optional(),
  pingStatus: z.enum(pingStatuses).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
})

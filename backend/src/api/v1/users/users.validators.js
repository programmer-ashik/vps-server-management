import { z } from '../../../core/validation/zod-openapi.js'

export const createUserSchema = z
  .object({
    email: z.string().email(),
    name: z.string().max(120).optional(),
    password: z.string().min(8).max(128),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .openapi('CreateUserBody')

export const updateUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().max(120).optional(),
    password: z.string().min(8).max(128).optional(),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .openapi('UpdateUserBody')

export const updateUserStatusSchema = z
  .object({
    status: z.enum(['active', 'inactive']),
  })
  .openapi('UpdateUserStatusBody')

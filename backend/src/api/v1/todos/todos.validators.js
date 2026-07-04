import { z } from '../../../core/validation/zod-openapi.js'

export const createTodoSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().max(500).optional(),
    completed: z.boolean().optional(),
  })
  .openapi('CreateTodoBody')

export const updateTodoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().max(500).optional(),
    completed: z.boolean().optional(),
  })
  .openapi('UpdateTodoBody')

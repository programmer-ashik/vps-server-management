import { z } from '../../core/validation/zod-openapi.js'

export const mongoIdParams = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path', required: true },
    example: '507f1f77bcf86cd799439011',
  }),
})

import { z } from '../../../core/validation/zod-openapi.js'

const subscriptionPlans = ['monthly', '3_monthly', '6_monthly', 'yearly']

export const createVpsSubscriptionsSchema = z
  .object({
    subscriptions: z
      .array(
        z.object({
          vpsServerId: z.string().min(1),
          subscriptionPlan: z.enum(subscriptionPlans),
          subscriptionPrice: z.number().nonnegative(),
          subscriptionStartDate: z.coerce.date().optional(),
        })
      )
      .min(1),
  })
  .openapi('CreateVpsSubscriptionsBody')

export const renewVpsSubscriptionSchema = z
  .object({
    subscriptionPlan: z.enum(subscriptionPlans),
    subscriptionPrice: z.number().nonnegative().optional(),
  })
  .openapi('RenewVpsSubscriptionBody')

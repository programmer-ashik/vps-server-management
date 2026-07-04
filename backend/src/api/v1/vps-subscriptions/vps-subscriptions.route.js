import { Router } from 'express'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import { asyncHandler } from '../../../utils/async-handler.js'
import {
  getVpsSubscription,
  postCancelVpsSubscription,
  postRenewVpsSubscription,
} from './vps-subscriptions.controller.js'
import { renewVpsSubscriptionSchema } from './vps-subscriptions.validators.js'

const router = Router()

router.use(requireAuth)

router.get('/:id', asyncHandler(getVpsSubscription))
router.post(
  '/:id/renew',
  zodValidate(renewVpsSubscriptionSchema, 'body'),
  asyncHandler(postRenewVpsSubscription)
)
router.post('/:id/cancel', asyncHandler(postCancelVpsSubscription))

export default router

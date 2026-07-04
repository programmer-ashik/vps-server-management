import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import {
  createVpsUserSchema,
  updateVpsUserSchema,
} from './vps-users.validators.js'
import { createVpsSubscriptionsSchema } from '../vps-subscriptions/vps-subscriptions.validators.js'
import {
  getVpsUsers,
  postVpsUser,
  getVpsUser,
  putVpsUser,
  postVpsSubscriptions,
  deleteVpsUserById,
} from './vps-users.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', asyncHandler(getVpsUsers))
router.post(
  '/',
  zodValidate(createVpsUserSchema, 'body'),
  asyncHandler(postVpsUser)
)
router.get('/:id', asyncHandler(getVpsUser))
router.put(
  '/:id',
  zodValidate(updateVpsUserSchema, 'body'),
  asyncHandler(putVpsUser)
)
router.post(
  '/:id/subscriptions',
  zodValidate(createVpsSubscriptionsSchema, 'body'),
  asyncHandler(postVpsSubscriptions)
)
router.delete('/:id', asyncHandler(deleteVpsUserById))

export default router

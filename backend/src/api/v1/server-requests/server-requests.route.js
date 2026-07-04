import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import {
  createServerRequestSchema,
  updateServerRequestSchema,
  updatePaymentStatusSchema,
  updateServerStatusSchema,
  sendServerDetailsSchema,
} from './server-requests.validators.js'
import {
  getServerRequests,
  postServerRequest,
  getServerRequest,
  putServerRequest,
  patchPaymentStatus,
  patchServerStatus,
  postSendServerDetails,
  deleteServerRequestById,
} from './server-requests.controller.js'

const router = Router()

router.post(
  '/',
  zodValidate(createServerRequestSchema, 'body'),
  asyncHandler(postServerRequest)
)

router.use(requireAuth)

router.get('/', asyncHandler(getServerRequests))
router.get('/:id', asyncHandler(getServerRequest))
router.put(
  '/:id',
  zodValidate(updateServerRequestSchema, 'body'),
  asyncHandler(putServerRequest)
)
router.patch(
  '/:id/payment-status',
  zodValidate(updatePaymentStatusSchema, 'body'),
  asyncHandler(patchPaymentStatus)
)
router.patch(
  '/:id/server-status',
  zodValidate(updateServerStatusSchema, 'body'),
  asyncHandler(patchServerStatus)
)
router.post(
  '/:id/send-server-details',
  zodValidate(sendServerDetailsSchema, 'body'),
  asyncHandler(postSendServerDetails)
)
router.delete('/:id', asyncHandler(deleteServerRequestById))

export default router

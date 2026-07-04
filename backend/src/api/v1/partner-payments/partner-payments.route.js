import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import { partnerPaymentUpload } from '../../../services/upload.middleware.js'
import {
  updatePartnerPaymentSchema,
  updatePartnerPaymentStatusSchema,
} from './partner-payments.validators.js'
import {
  getPartnerPayments,
  postPartnerPayment,
  getPartnerPayment,
  putPartnerPayment,
  patchPartnerPaymentStatus,
  deletePartnerPaymentById,
} from './partner-payments.controller.js'

const router = Router()

router.post(
  '/',
  partnerPaymentUpload.single('screenshot'),
  asyncHandler(postPartnerPayment)
)

router.use(requireAuth)

router.get('/', asyncHandler(getPartnerPayments))
router.get('/:id', asyncHandler(getPartnerPayment))
router.put(
  '/:id',
  zodValidate(updatePartnerPaymentSchema, 'body'),
  asyncHandler(putPartnerPayment)
)
router.patch(
  '/:id/status',
  zodValidate(updatePartnerPaymentStatusSchema, 'body'),
  asyncHandler(patchPartnerPaymentStatus)
)
router.delete('/:id', asyncHandler(deletePartnerPaymentById))

export default router

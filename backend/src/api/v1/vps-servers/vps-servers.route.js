import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import {
  createVpsServerSchema,
  updateVpsServerSchema,
  updateAvailabilityStatusSchema,
} from './vps-servers.validators.js'
import {
  getVpsServers,
  postVpsServer,
  getVpsServer,
  putVpsServer,
  patchAvailabilityStatus,
  postPingVpsServer,
  deleteVpsServerById,
} from './vps-servers.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', asyncHandler(getVpsServers))
router.post(
  '/',
  zodValidate(createVpsServerSchema, 'body'),
  asyncHandler(postVpsServer)
)
router.get('/:id', asyncHandler(getVpsServer))
router.put(
  '/:id',
  zodValidate(updateVpsServerSchema, 'body'),
  asyncHandler(putVpsServer)
)
router.patch(
  '/:id/availability-status',
  zodValidate(updateAvailabilityStatusSchema, 'body'),
  asyncHandler(patchAvailabilityStatus)
)
router.post('/:id/ping', asyncHandler(postPingVpsServer))
router.delete('/:id', asyncHandler(deleteVpsServerById))

export default router

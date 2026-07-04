import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { getDashboardSummary } from './dashboard.controller.js'

const router = Router()

router.use(requireAuth)
router.get('/summary', asyncHandler(getDashboardSummary))

export default router

import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import { loginSchema } from './auth.validators.js'
import { postLogin, getMe } from './auth.controller.js'

const router = Router()

router.post('/login', zodValidate(loginSchema, 'body'), asyncHandler(postLogin))
router.get('/me', requireAuth, asyncHandler(getMe))

export default router

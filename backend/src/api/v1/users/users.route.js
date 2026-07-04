import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from './users.validators.js'
import {
  getUsers,
  postUser,
  getUser,
  putUser,
  patchUserStatus,
  deleteUserById,
} from './users.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', asyncHandler(getUsers))
router.post('/', zodValidate(createUserSchema, 'body'), asyncHandler(postUser))
router.get('/:id', asyncHandler(getUser))
router.put('/:id', zodValidate(updateUserSchema, 'body'), asyncHandler(putUser))
router.patch(
  '/:id/status',
  zodValidate(updateUserStatusSchema, 'body'),
  asyncHandler(patchUserStatus)
)
router.delete('/:id', asyncHandler(deleteUserById))

export default router

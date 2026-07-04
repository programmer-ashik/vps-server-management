import { Router } from 'express'
import { asyncHandler } from '../../../utils/async-handler.js'
import { requireAuth } from '../../../core/auth/auth.middleware.js'
import { zodValidate } from '../../../core/http/validate.middleware.js'
import { createTodoSchema, updateTodoSchema } from './todos.validators.js'
import {
  getTodos,
  postTodo,
  getTodo,
  putTodo,
  deleteTodoById,
} from './todos.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', asyncHandler(getTodos))
router.post('/', zodValidate(createTodoSchema, 'body'), asyncHandler(postTodo))
router.get('/:id', asyncHandler(getTodo))
router.put('/:id', zodValidate(updateTodoSchema, 'body'), asyncHandler(putTodo))
router.delete('/:id', asyncHandler(deleteTodoById))

export default router



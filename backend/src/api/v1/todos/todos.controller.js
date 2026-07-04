import {
  listTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
} from './todos.service.js'
import { mapTodo, mapTodos } from './todos.mapper.js'
import { NotFound } from '../../../core/http/error.types.js'

export async function getTodos(_req, res) {
  const todos = await listTodos()
  res.ok(mapTodos(todos))
}

export async function postTodo(req, res) {
  const { title, description, completed } = req.body ?? {}
  const created = await createTodo({ title, description, completed })
  res.ok(mapTodo(created), 201)
}

export async function getTodo(req, res) {
  const todo = await getTodoById(req.params.id)
  if (!todo) {
    throw new NotFound('Todo not found')
  }
  res.ok(mapTodo(todo))
}

export async function putTodo(req, res) {
  const updated = await updateTodo(req.params.id, req.body ?? {})
  if (!updated) {
    throw new NotFound('Todo not found')
  }
  res.ok(mapTodo(updated))
}

export async function deleteTodoById(req, res) {
  const deleted = await deleteTodo(req.params.id)
  if (!deleted) {
    throw new NotFound('Todo not found')
  }
  res.ok({ id: deleted.id })
}



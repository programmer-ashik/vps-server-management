import {
  findAllTodos,
  createTodoRecord,
  findTodoById,
  updateTodoById,
  deleteTodoById,
} from './todos.repo.js'

export async function listTodos() {
  return findAllTodos()
}

export async function createTodo(input) {
  return createTodoRecord(input)
}

export async function getTodoById(id) {
  return findTodoById(id)
}

export async function updateTodo(id, input) {
  return updateTodoById(id, input)
}

export async function deleteTodo(id) {
  return deleteTodoById(id)
}



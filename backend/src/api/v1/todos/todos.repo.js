import { TodoModel } from './Todo.model.js'

export async function findAllTodos() {
  return TodoModel.find().lean().exec()
}

export async function createTodoRecord(input) {
  return TodoModel.create({
    title: input.title,
    description: input.description,
    completed: input.completed ?? false,
  })
}

export async function findTodoById(id) {
  return TodoModel.findById(id).exec()
}

export async function updateTodoById(
  id,
  input
) {
  return TodoModel.findByIdAndUpdate(id, input, { new: true }).exec()
}

export async function deleteTodoById(id) {
  return TodoModel.findByIdAndDelete(id).exec()
}



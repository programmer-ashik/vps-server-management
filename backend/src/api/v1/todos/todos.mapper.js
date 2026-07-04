export function mapTodo(todo) {
  return {
    id: String(
      (todo?._id) ??
        (todo?.id)
    ),
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }
}

export function mapTodos(todos) {
  return todos.map(mapTodo)
}



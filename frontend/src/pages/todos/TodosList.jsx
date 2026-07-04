import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteTodoMutation, useGetTodosQuery } from '../../api/todoApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function TodosList() {
  const { data: todos = [], isLoading } = useGetTodosQuery();
  const [deleteTodo] = useDeleteTodoMutation();
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTodo(deleteId).unwrap();
    setDeleteId(null);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Todos</h1>
        <Link to="/todos/new" className="bg-accent-500 text-white px-4 py-2 rounded-md">
          Create Todo
        </Link>
      </div>
      <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Completed</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.id} className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="p-4">{todo.title}</td>
                <td className="p-4">{todo.description || '-'}</td>
                <td className="p-4">{todo.completed ? 'Yes' : 'No'}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/todos/${todo.id}`} className="px-3 py-1.5 border rounded-md">
                      Edit
                    </Link>
                    <button onClick={() => setDeleteId(todo.id)} className="px-3 py-1.5 border border-red-400 rounded-md">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Todo"
        message="Are you sure you want to delete this todo?"
      />
    </div>
  );
}

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTodoMutation } from '../../api/todoApi';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const todoSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  description: z
    .string()
    .trim()
    .max(300, 'Description can be up to 300 characters'),
  completed: z.boolean(),
});

export default function TodoCreate() {
  const [createTodo, { isLoading }] = useCreateTodoMutation();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: '', description: '', completed: false },
    mode: 'onChange',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Todo</h1>
      <form
        onSubmit={handleSubmit(async (values) => {
          try {
            await createTodo(values).unwrap();
            navigate('/todos');
          } catch {
            setError('root', {
              type: 'server',
              message: 'Failed to create todo',
            });
          }
        })}
        className="space-y-4"
      >
        <Input label="Title" {...register('title')} />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
        <Input label="Description" {...register('description')} />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
        <label className="flex items-center gap-2">
          <Controller
            name="completed"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                ref={ref}
              />
            )}
          />
          Completed
        </label>
        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading || !isValid}>
            {isLoading ? 'Creating...' : 'Create Todo'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/todos')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

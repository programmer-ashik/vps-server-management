import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUserMutation } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';

const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive']),
});

export default function UserCreate() {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user', status: 'active' },
    mode: 'onChange',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Create User</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Add a new admin or staff user</p>
      </div>
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 bg-white dark:bg-neutral-800 shadow-sm">
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              await createUser(values).unwrap();
              showToast('User created');
              navigate('/users');
            } catch {
              setError('root', { type: 'server', message: 'Failed to create user' });
            }
          })}
          className="space-y-5"
        >
          <Input label="Name" required {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          <Input label="Email" type="email" required {...register('email')} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          <Input label="Password" type="password" required {...register('password')} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          <Select label="Role" {...register('role')}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateUserMutation, useGetUserQuery } from '../../api/userApi';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';

const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive']),
});

export default function UserEdit() {
  const { id } = useParams();
  const { data: user, isLoading: isLoadingUser } = useGetUserQuery(id ?? '');
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user', status: 'active' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email,
        password: '',
        role: user.role === 'admin' ? 'admin' : 'user',
        status: user.status === 'inactive' ? 'inactive' : 'active',
      });
    }
  }, [user, reset]);

  if (isLoadingUser) return <div className="p-8 text-center">Loading…</div>;
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 border border-red-200 rounded-lg bg-red-50 text-red-700">
        User not found.
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/users')}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit User</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Update user information</p>
      </div>
      <div className="border rounded-lg p-6 bg-white dark:bg-neutral-800 shadow-sm">
        <form
          onSubmit={handleSubmit(async (values) => {
            if (!id) return;
            const payload = { ...values };
            if (!payload.password) delete payload.password;
            try {
              await updateUser({ id, ...payload }).unwrap();
              showToast('User updated');
              navigate('/users');
            } catch {
              setError('root', { type: 'server', message: 'Failed to update user' });
            }
          })}
          className="space-y-5"
        >
          <Input label="Name" required {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          <Input label="Email" type="email" required {...register('email')} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          <Input label="New Password (optional)" type="password" {...register('password')} />
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
              {isLoading ? 'Updating...' : 'Update User'}
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

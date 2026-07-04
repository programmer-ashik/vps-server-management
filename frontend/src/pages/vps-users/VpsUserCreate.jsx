import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateVpsUserMutation } from '../../api/vpsUserApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';

const schema = z.object({
  customerName: z.string().trim().min(1, 'Name is required'),
  customerEmail: z.string().trim().email('Enter a valid email'),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export default function VpsUserCreate() {
  const [createUser, { isLoading }] = useCreateVpsUserMutation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
    },
    mode: 'onChange',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add VPS User</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Create an onboarding customer, then assign one or more VPS subscriptions from the detail page.
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-white dark:bg-neutral-800 shadow-sm">
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              const created = await createUser({
                customerName: values.customerName,
                customerEmail: values.customerEmail,
                customerPhone: values.customerPhone || undefined,
                notes: values.notes || undefined,
              }).unwrap();
              showToast('VPS user created');
              navigate(`/vps-users/${created.id}`);
            } catch {
              setError('root', { type: 'server', message: 'Failed to create VPS user' });
            }
          })}
          className="space-y-5"
        >
          <Input label="Customer Name" required {...register('customerName')} />
          {errors.customerName && <p className="text-xs text-red-500">{errors.customerName.message}</p>}
          <Input label="Email" type="email" required {...register('customerEmail')} />
          {errors.customerEmail && <p className="text-xs text-red-500">{errors.customerEmail.message}</p>}
          <Input label="Phone" {...register('customerPhone')} />
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              placeholder="Internal notes..."
            />
          </div>
          {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? 'Creating...' : 'Create VPS User'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/vps-users')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

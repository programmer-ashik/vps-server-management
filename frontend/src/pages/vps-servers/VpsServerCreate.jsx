import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateVpsServerMutation } from '../../api/vpsServerApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  serverDetails: z.string().trim().min(1, 'Server details are required'),
  ip: z.string().trim().min(1, 'IP is required'),
  username: z.string().optional(),
  password: z.string().optional(),
  panelUrl: z.string().optional(),
  additionalNotes: z.string().optional(),
  isActive: z.boolean(),
});

export default function VpsServerCreate() {
  const [createServer, { isLoading }] = useCreateVpsServerMutation();
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
      name: '',
      serverDetails: '',
      ip: '',
      username: '',
      password: '',
      panelUrl: '',
      additionalNotes: '',
      isActive: true,
    },
    mode: 'onChange',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add VPS Server</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Add a new VPS to your inventory pool
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-white dark:bg-neutral-800 shadow-sm">
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              const body = {
                name: values.name,
                serverDetails: values.serverDetails,
                ip: values.ip,
                isActive: values.isActive,
                credentials: {
                  username: values.username || undefined,
                  password: values.password || undefined,
                  panelUrl: values.panelUrl || undefined,
                  additionalNotes: values.additionalNotes || undefined,
                },
              };
              const created = await createServer(body).unwrap();
              showToast('VPS server created');
              navigate(`/vps-servers/${created.id}`);
            } catch {
              setError('root', { type: 'server', message: 'Failed to create VPS server' });
            }
          })}
          className="space-y-5"
        >
          <Input label="Server Name" required {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Server Details</label>
            <textarea
              {...register('serverDetails')}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              placeholder="2 vCPU, 4GB RAM, 80GB SSD — Ubuntu 22.04"
            />
            {errors.serverDetails && <p className="text-xs text-red-500">{errors.serverDetails.message}</p>}
          </div>
          <Input label="IP Address" required {...register('ip')} />
          {errors.ip && <p className="text-xs text-red-500">{errors.ip.message}</p>}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Access Credentials</h3>
            <div className="space-y-4">
              <Input label="Username" {...register('username')} />
              <Input label="Password" type="text" {...register('password')} />
              <Input label="Panel URL" {...register('panelUrl')} />
              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  {...register('additionalNotes')}
                  rows={2}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isActive')} className="rounded" />
            Enable automatic ping monitoring
          </label>
          {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? 'Creating…' : 'Create VPS Server'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/vps-servers')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

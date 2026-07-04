import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateServerRequestMutation } from '../../api/serverRequestApi';
import { useToast } from '../../components/common/useToast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const requestSchema = z.object({
  customerName: z.string().trim().min(1, 'Name is required'),
  customerEmail: z.string().trim().email('Enter a valid email'),
  customerPhone: z.string().trim().optional(),
  transactionType: z.enum(['Nagad', 'bKash']),
  transactionId: z.string().trim().min(1, 'Transaction ID is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  subscriptionPlan: z.enum(['monthly', '3_monthly', '6_monthly', 'yearly']),
  description: z.string().trim().optional(),
});

const planOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: '3_monthly', label: '3 Months' },
  { value: '6_monthly', label: '6 Months' },
  { value: 'yearly', label: 'Yearly' },
];

const highlights = [
  { label: 'Fast review', value: 'Payment details are reviewed from the portal.' },
  { label: 'Flexible plans', value: 'Monthly, quarterly, half-yearly, or yearly.' },
  { label: 'Clear submission', value: 'One form for transaction and VPS request details.' },
];

const lightFieldClassName =
  '!border-neutral-300 !bg-white !text-neutral-900 placeholder:!text-neutral-400';

export default function AddPaymentRequest() {
  const [createServerRequest, { isLoading }] = useCreateServerRequestMutation();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      transactionType: 'bKash',
      transactionId: '',
      amount: '',
      subscriptionPlan: 'monthly',
      description: '',
    },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createServerRequest({
        customerName: values.customerName,
        customerEmail: values.customerEmail.toLowerCase(),
        customerPhone: values.customerPhone || undefined,
        transactionType: values.transactionType,
        transactionId: values.transactionId,
        amount: values.amount,
        subscriptionPlan: values.subscriptionPlan,
        description: values.description || undefined,
      }).unwrap();
      showToast('Payment request submitted successfully');
      reset();
    } catch {
      setError('root', {
        type: 'server',
        message: 'Failed to submit request. Please try again.',
      });
    }
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf5_0%,#fff7ed_28%,#f8fafc_100%)] text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <section className="relative overflow-hidden rounded-[28px] border border-amber-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_54%,#fffbeb_100%)] p-7 shadow-[0_30px_80px_-36px_rgba(251,146,60,0.45)] md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-200/35 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
                Genzit vps
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
                Submit your VPS payment request in one clean step.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 md:text-lg">
                Share your payment details and requested VPS duration. After verification,
                your request will move forward for approval and server assignment.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-amber-100 bg-white/70 p-5">
                <p className="text-sm font-medium text-neutral-900">What to prepare</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Keep your transaction ID, amount, payment method, and preferred VPS plan ready
                  before submitting the request.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)] md:p-8">
            <form
              onSubmit={onSubmit}
              className="space-y-5 [&_label]:!text-neutral-800 [&_label]:font-medium"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Payment Request
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Add your details</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Fill in the payment information carefully so the request can be verified without delay.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input label="Full Name" required className={lightFieldClassName} {...register('customerName')} />
                  {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
                </div>
                <div>
                  <Input label="Email Address" type="email" required className={lightFieldClassName} {...register('customerEmail')} />
                  {errors.customerEmail && <p className="mt-1 text-xs text-red-500">{errors.customerEmail.message}</p>}
                </div>
                <div>
                  <Input label="Phone Number" className={lightFieldClassName} {...register('customerPhone')} />
                </div>
                <div>
                  <Select label="Payment Type" className={lightFieldClassName} {...register('transactionType')}>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </Select>
                </div>
                <div>
                  <Input label="Transaction ID" required className={lightFieldClassName} {...register('transactionId')} />
                  {errors.transactionId && <p className="mt-1 text-xs text-red-500">{errors.transactionId.message}</p>}
                </div>
                <div>
                  <Input label="Amount" type="number" min="1" required className={lightFieldClassName} {...register('amount')} />
                  {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Select label="VPS Plan / Duration" className={lightFieldClassName} {...register('subscriptionPlan')}>
                    {planOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700">
                  Notes
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Optional details about your request"
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

              <Button type="submit" disabled={isLoading || !isValid} className="w-full py-3">
                {isLoading ? 'Submitting...' : 'Submit Payment Request'}
              </Button>

              <p className="text-center text-xs text-neutral-500">
                Submitted requests are queued for verification and approval.
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

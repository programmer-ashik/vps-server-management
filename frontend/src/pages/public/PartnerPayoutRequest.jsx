import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePartnerPaymentRequestMutation } from '../../api/partnerPaymentApi';
import { useToast } from '../../components/common/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const payoutSchema = z.object({
  partnerName: z.string().trim().min(1, 'Name is required'),
  partnerEmail: z.string().trim().email('Enter a valid email'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  bankAccountNumber: z.string().trim().min(4, 'Bank account number is required'),
  notes: z.string().trim().optional(),
});

const lightFieldClassName =
  '!border-neutral-300 !bg-white !text-neutral-900 placeholder:!text-neutral-400';

const benefits = [
  {
    title: 'One payout queue',
    body: 'Every partner payout request lands in the admin portal for review, approval, and settlement tracking.',
  },
  {
    title: 'Proof attached',
    body: 'Attach the payment screenshot when available, or submit the request without it.',
  },
  {
    title: 'Clear settlement flow',
    body: 'Approved requests move to unpaid until the transfer is completed and marked paid by admin.',
  },
];

export default function PartnerPayoutRequest() {
  const [createPartnerPaymentRequest, { isLoading }] =
    useCreatePartnerPaymentRequestMutation();
  const { showToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      partnerName: '',
      partnerEmail: '',
      amount: '',
      bankAccountNumber: '',
      notes: '',
    },
    mode: 'onChange',
  });

  const fileLabel = useMemo(() => {
    if (!selectedFile) return 'PNG, JPG, WEBP, or GIF up to 5MB';
    const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return `${selectedFile.name} - ${sizeMb} MB`;
  }, [selectedFile]);

  const assignFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    clearErrors('screenshot');
  };

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.append('partnerName', values.partnerName);
    formData.append('partnerEmail', values.partnerEmail.toLowerCase());
    formData.append('amount', String(values.amount));
    formData.append('bankAccountNumber', values.bankAccountNumber);
    if (values.notes?.trim()) {
      formData.append('notes', values.notes.trim());
    }
    if (selectedFile) {
      formData.append('screenshot', selectedFile);
    }

    try {
      await createPartnerPaymentRequest(formData).unwrap();
      showToast('Partner payment request submitted');
      reset();
      setSelectedFile(null);
    } catch (error) {
      const message =
        error?.data?.message ??
        error?.data?.details?.[0]?.message ??
        'Failed to submit partner payment request';
      setError('root', {
        type: 'server',
        message,
      });
    }
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdfdfd_0%,#f3f8ff_34%,#fff7ed_100%)] text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <section className="relative overflow-hidden rounded-[30px] border border-sky-100 bg-[linear-gradient(140deg,#ffffff_0%,#f0f9ff_55%,#fff7ed_100%)] p-7 shadow-[0_34px_90px_-40px_rgba(59,130,246,0.32)] md:p-10">
            <div className="absolute -right-8 top-6 h-44 w-44 rounded-full bg-sky-200/45 blur-3xl" />
            <div className="absolute -left-8 bottom-4 h-40 w-40 rounded-full bg-amber-200/35 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">
                Genzit vps
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
                Submit a partner payout request with payment proof.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 md:text-lg">
                Share your payout amount, account number, and screenshot once. Admin
                will review the request, approve it, and settle it from the portal.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {benefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-sky-100 bg-white/75 p-5">
                <p className="text-sm font-medium text-neutral-900">Before you submit</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Use the bank account number where you expect payout and enter the amount in USD.
                  The screenshot can be attached now or added later.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-[0_26px_70px_-40px_rgba(15,23,42,0.3)] md:p-8">
            <form
              onSubmit={onSubmit}
              className="space-y-5 [&_label]:!text-neutral-800 [&_label]:font-medium"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Partner Payment
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Payout request form</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Add the payout details carefully. The submitted date is recorded automatically.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input label="Full Name" required className={lightFieldClassName} {...register('partnerName')} />
                  {errors.partnerName && <p className="mt-1 text-xs text-red-500">{errors.partnerName.message}</p>}
                </div>
                <div>
                  <Input label="Email Address" type="email" required className={lightFieldClassName} {...register('partnerEmail')} />
                  {errors.partnerEmail && <p className="mt-1 text-xs text-red-500">{errors.partnerEmail.message}</p>}
                </div>
                <div>
                  <Input label="Amount (USD)" type="number" min="1" step="0.01" required className={lightFieldClassName} {...register('amount')} />
                  {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
                </div>
                <div>
                  <Input label="Bank Account Number" required className={lightFieldClassName} {...register('bankAccountNumber')} />
                  {errors.bankAccountNumber && <p className="mt-1 text-xs text-red-500">{errors.bankAccountNumber.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="Optional notes for payout verification"
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Payment Screenshot (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    assignFile(event.dataTransfer.files?.[0]);
                  }}
                  className={`w-full rounded-2xl border border-dashed px-5 py-7 text-left transition ${
                    dragActive
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-neutral-300 bg-neutral-50 hover:border-accent-400 hover:bg-accent-50/60'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      Drag and drop screenshot here
                    </span>
                    <span className="text-sm text-neutral-500">
                      or click to browse from your device
                    </span>
                    <span className="text-xs text-neutral-400">{fileLabel}</span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => assignFile(event.target.files?.[0] ?? null)}
                />
              </div>

              {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

              <Button type="submit" disabled={isLoading || !isValid} className="w-full py-3">
                {isLoading ? 'Submitting...' : 'Submit Partner Payment'}
              </Button>

              <p className="text-center text-xs text-neutral-500">
                Approved requests move to unpaid until admin completes the payout.
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

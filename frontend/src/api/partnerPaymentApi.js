import { baseApi } from './baseApi';

export const partnerPaymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPartnerPaymentRequest: build.mutation({
      query: (formData) => ({
        url: '/partner-payments',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response?.data,
    }),
    getPartnerPayments: build.query({
      query: (params) => ({ url: '/partner-payments', params }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result = []) => [
        'PartnerPayment',
        ...result.map((payment) => ({ type: 'PartnerPayment', id: payment.id })),
      ],
    }),
    getPartnerPayment: build.query({
      query: (id) => `/partner-payments/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_result, _error, id) => [{ type: 'PartnerPayment', id }],
    }),
    updatePartnerPayment: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/partner-payments/${id}`,
        method: 'PUT',
        body: patch,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PartnerPayment', id },
        'PartnerPayment',
        'Dashboard',
      ],
    }),
    updatePartnerPaymentStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/partner-payments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PartnerPayment', id },
        'PartnerPayment',
        'Dashboard',
      ],
    }),
    deletePartnerPayment: build.mutation({
      query: (id) => ({ url: `/partner-payments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PartnerPayment', 'Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreatePartnerPaymentRequestMutation,
  useGetPartnerPaymentsQuery,
  useGetPartnerPaymentQuery,
  useUpdatePartnerPaymentMutation,
  useUpdatePartnerPaymentStatusMutation,
  useDeletePartnerPaymentMutation,
} = partnerPaymentApi;

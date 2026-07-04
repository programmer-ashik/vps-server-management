import { baseApi } from './baseApi';

export const serverRequestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServerRequests: build.query({
      query: (params) => ({ url: '/server-requests', params }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result = []) =>
        ['ServerRequest', ...result.map((r) => ({ type: 'ServerRequest', id: r.id }))],
    }),
    getServerRequest: build.query({
      query: (id) => `/server-requests/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'ServerRequest', id }],
    }),
    createServerRequest: build.mutation({
      query: (body) => ({ url: '/server-requests', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['ServerRequest', 'VpsUser'],
    }),
    updateServerRequest: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/server-requests/${id}`,
        method: 'PUT',
        body: patch,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServerRequest', id }, 'ServerRequest', 'Dashboard'],
    }),
    updatePaymentStatus: build.mutation({
      query: ({ id, paymentStatus }) => ({
        url: `/server-requests/${id}/payment-status`,
        method: 'PATCH',
        body: { paymentStatus },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServerRequest', id }, 'ServerRequest', 'Dashboard', 'VpsUser'],
    }),
    updateServerStatus: build.mutation({
      query: ({ id, serverStatus }) => ({
        url: `/server-requests/${id}/server-status`,
        method: 'PATCH',
        body: { serverStatus },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServerRequest', id }, 'ServerRequest', 'Dashboard', 'VpsUser'],
    }),
    sendServerDetails: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/server-requests/${id}/send-server-details`,
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServerRequest', id }, 'ServerRequest', 'Dashboard'],
    }),
    deleteServerRequest: build.mutation({
      query: (id) => ({ url: `/server-requests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ServerRequest', 'Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServerRequestsQuery,
  useGetServerRequestQuery,
  useCreateServerRequestMutation,
  useUpdateServerRequestMutation,
  useUpdatePaymentStatusMutation,
  useUpdateServerStatusMutation,
  useSendServerDetailsMutation,
  useDeleteServerRequestMutation,
} = serverRequestApi;

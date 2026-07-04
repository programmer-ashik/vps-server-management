import { baseApi } from './baseApi';

export const vpsUserApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVpsUsers: build.query({
      query: (params) => ({ url: '/vps-users', params }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result = []) =>
        ['VpsUser', ...result.map((r) => ({ type: 'VpsUser', id: r.id }))],
    }),
    getVpsUser: build.query({
      query: (id) => `/vps-users/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'VpsUser', id }],
    }),
    createVpsUser: build.mutation({
      query: (body) => ({ url: '/vps-users', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['VpsUser', 'VpsServer', 'ServerRequest'],
    }),
    updateVpsUser: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/vps-users/${id}`,
        method: 'PUT',
        body: patch,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'VpsUser', id }, 'VpsUser', 'VpsServer', 'VpsSubscription'],
    }),
    addVpsSubscriptions: build.mutation({
      query: ({ id, subscriptions }) => ({
        url: `/vps-users/${id}/subscriptions`,
        method: 'POST',
        body: { subscriptions },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'VpsUser', id }, 'VpsUser', 'VpsServer', 'VpsSubscription'],
    }),
    deleteVpsUser: build.mutation({
      query: (id) => ({ url: `/vps-users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['VpsUser', 'VpsServer', 'VpsSubscription'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVpsUsersQuery,
  useGetVpsUserQuery,
  useCreateVpsUserMutation,
  useUpdateVpsUserMutation,
  useAddVpsSubscriptionsMutation,
  useDeleteVpsUserMutation,
} = vpsUserApi;

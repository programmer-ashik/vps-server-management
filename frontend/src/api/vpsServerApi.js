import { baseApi } from './baseApi';

export const vpsServerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVpsServers: build.query({
      query: (params) => ({ url: '/vps-servers', params }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result = []) =>
        ['VpsServer', ...result.map((r) => ({ type: 'VpsServer', id: r.id }))],
    }),
    getVpsServer: build.query({
      query: (id) => `/vps-servers/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'VpsServer', id }],
    }),
    createVpsServer: build.mutation({
      query: (body) => ({ url: '/vps-servers', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['VpsServer'],
    }),
    updateVpsServer: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/vps-servers/${id}`,
        method: 'PUT',
        body: patch,
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'VpsServer', id }, 'VpsServer', 'VpsUser'],
    }),
    pingVpsServer: build.mutation({
      query: (id) => ({ url: `/vps-servers/${id}/ping`, method: 'POST' }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, id) => [{ type: 'VpsServer', id }, 'VpsServer'],
    }),
    deleteVpsServer: build.mutation({
      query: (id) => ({ url: `/vps-servers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['VpsServer', 'VpsUser'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVpsServersQuery,
  useGetVpsServerQuery,
  useCreateVpsServerMutation,
  useUpdateVpsServerMutation,
  usePingVpsServerMutation,
  useDeleteVpsServerMutation,
} = vpsServerApi;

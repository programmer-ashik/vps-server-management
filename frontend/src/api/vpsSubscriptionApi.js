import { baseApi } from './baseApi';

export const vpsSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVpsSubscription: build.query({
      query: (id) => `/vps-subscriptions/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'VpsSubscription', id }],
    }),
    renewVpsSubscription: build.mutation({
      query: ({ id, subscriptionPlan, subscriptionPrice }) => ({
        url: `/vps-subscriptions/${id}/renew`,
        method: 'POST',
        body: { subscriptionPlan, subscriptionPrice },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'VpsSubscription', id }, 'VpsSubscription', 'VpsUser', 'VpsServer'],
    }),
    cancelVpsSubscription: build.mutation({
      query: (id) => ({
        url: `/vps-subscriptions/${id}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, id) => [{ type: 'VpsSubscription', id }, 'VpsSubscription', 'VpsUser', 'VpsServer'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVpsSubscriptionQuery,
  useRenewVpsSubscriptionMutation,
  useCancelVpsSubscriptionMutation,
} = vpsSubscriptionApi;

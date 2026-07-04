import { baseApi } from './baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query({
      query: () => '/dashboard/summary',
      transformResponse: (response) => response?.data,
      providesTags: ['Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardSummaryQuery } = dashboardApi;

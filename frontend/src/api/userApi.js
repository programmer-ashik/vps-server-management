import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['Auth'],
    }),
    getMe: build.query({
      query: () => '/auth/me',
      transformResponse: (response) => response?.data,
      providesTags: ['Auth'],
    }),
    getUsers: build.query({
      query: (q) => ({ url: '/users', params: q }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result = []) =>
        ['User', ...result.map((u) => ({ type: 'User', id: u.id }))],
    }),
    getUser: build.query({
      query: (id) => `/users/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),
    createUser: build.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['User'],
    }),
    updateUser: build.mutation({
      query: ({ id, ...patch }) => ({ url: `/users/${id}`, method: 'PUT', body: patch }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, 'User'],
    }),
    updateUserStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: build.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userApi;

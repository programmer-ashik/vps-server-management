import { baseApi } from './baseApi';

export const todoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodos: build.query({
      query: () => '/todos',
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result = []) => ['Todo', ...result.map((t) => ({ type: 'Todo', id: t.id }))],
    }),
    getTodo: build.query({
      query: (id) => `/todos/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'Todo', id }],
    }),
    createTodo: build.mutation({
      query: (body) => ({ url: '/todos', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['Todo'],
    }),
    updateTodo: build.mutation({
      query: ({ id, ...patch }) => ({ url: `/todos/${id}`, method: 'PUT', body: patch }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Todo', id }],
    }),
    deleteTodo: build.mutation({
      query: (id) => ({ url: `/todos/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['Todo'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTodosQuery,
  useGetTodoQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todoApi;

import { baseApi } from './baseApi';
import type { Topic, ApiResponse } from '../../types';

export const topicsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopics: builder.query<ApiResponse<Topic[]>, void>({
      query: () => '/topics',
      providesTags: ['Topics'],
    }),
    getTopic: builder.query<ApiResponse<Topic>, string>({
      query: (id) => `/topics/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Topics', id }],
    }),
    createTopic: builder.mutation<ApiResponse<Topic>, Partial<Topic>>({
      query: (body) => ({ url: '/topics', method: 'POST', body }),
      invalidatesTags: ['Topics'],
    }),
    updateTopic: builder.mutation<ApiResponse<Topic>, { id: string } & Partial<Topic>>({
      query: ({ id, ...body }) => ({ url: `/topics/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Topics'],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useGetTopicQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
} = topicsApi;

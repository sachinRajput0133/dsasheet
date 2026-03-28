import { baseApi } from './baseApi';
import type { ApiResponse, ProgressStats, TopicStat } from '../../types';

export const progressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProgress: builder.query<ApiResponse<Record<string, boolean>>, void>({
      query: () => '/progress',
      providesTags: ['Progress'],
    }),
    getProgressStats: builder.query<ApiResponse<ProgressStats>, void>({
      query: () => '/progress/stats',
      providesTags: ['Progress'],
    }),
    getTopicStats: builder.query<ApiResponse<TopicStat[]>, void>({
      query: () => '/progress/topic-stats',
      providesTags: ['Progress'],
    }),
    toggleProgress: builder.mutation<
      ApiResponse<{ problemId: string; completed: boolean }>,
      { problemId: string; completed: boolean }
    >({
      query: (body) => ({ url: '/progress/toggle', method: 'POST', body }),
      // Optimistic update: immediately reflect the change in the cache
      async onQueryStarted({ problemId, completed }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          progressApi.util.updateQueryData('getProgress', undefined, (draft) => {
            draft.data[problemId] = completed;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Progress'],
    }),
  }),
});

export const {
  useGetProgressQuery,
  useGetProgressStatsQuery,
  useGetTopicStatsQuery,
  useToggleProgressMutation,
} = progressApi;

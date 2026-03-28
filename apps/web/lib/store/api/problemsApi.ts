import { baseApi } from './baseApi';
import type { Problem, ApiResponse, PaginatedProblems } from '../../types';

interface ProblemsQueryParams {
  topicId?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const problemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProblems: builder.query<ApiResponse<PaginatedProblems>, ProblemsQueryParams>({
      query: (params) => ({ url: '/problems', params }),
      providesTags: ['Problems'],
    }),
    getProblem: builder.query<ApiResponse<Problem>, string>({
      query: (id) => `/problems/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Problems', id }],
    }),
    createProblem: builder.mutation<ApiResponse<Problem>, Partial<Problem>>({
      query: (body) => ({ url: '/problems', method: 'POST', body }),
      invalidatesTags: ['Problems'],
    }),
    updateProblem: builder.mutation<ApiResponse<Problem>, { id: string } & Partial<Problem>>({
      query: ({ id, ...body }) => ({ url: `/problems/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Problems', id }, 'Problems'],
    }),
    deleteProblem: builder.mutation<void, string>({
      query: (id) => ({ url: `/problems/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Problems'],
    }),
  }),
});

export const {
  useGetProblemsQuery,
  useGetProblemQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} = problemsApi;

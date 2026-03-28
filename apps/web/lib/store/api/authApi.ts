import { baseApi } from './baseApi';
import type { User, ApiResponse } from '../../types';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    signup: builder.mutation<ApiResponse<AuthResponse>, { name: string; email: string; password: string }>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    logout: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Topics', 'Problems', 'Progress'],
    }),
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useLogoutMutation, useGetMeQuery } = authApi;

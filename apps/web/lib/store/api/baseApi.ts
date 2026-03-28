import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { setAccessToken, clearCredentials } from '../authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
  credentials: 'include', // Include cookies (refresh token)
});

// Re-auth base query: on 401, attempt token refresh then retry once
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  let result = await rawBaseQuery(args, api, extra);

  if (result.error?.status === 401) {
    // Try refresh
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extra,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { data: { accessToken: string } };
      api.dispatch(setAccessToken(data.data.accessToken));
      // Retry original request with new token
      result = await rawBaseQuery(args, api, extra);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Topics', 'Problems', 'Progress'],
  endpoints: () => ({}),
});

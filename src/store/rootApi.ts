import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Root API slice using RTK Query.
 *
 * This is the base API that all feature API slices extend using `injectEndpoints()`.
 * It centralizes:
 * - Base URL configuration
 * - Common headers (auth tokens, content-type, etc.)
 * - Error handling
 * - Cache tag types for invalidation
 *
 * @example
 * ```typescript
 * // In a feature slice
 * import { rootApi } from '@/store/rootApi'
 *
 * export const authApi = rootApi.injectEndpoints({
 *   endpoints: (builder) => ({
 *     login: builder.mutation({...}),
 *   }),
 * })
 * ```
 */
export const rootApi = createApi({
  /**
   * The reducer path for this API in the Redux store.
   * This is used in store/index.ts: [rootApi.reducerPath]: rootApi.reducer
   */
  reducerPath: "api",

  /**
   * Base query configuration for all API calls.
   * Handles base URL, headers, and request preparation.
   */
  baseQuery: fetchBaseQuery({
    /**
     * Base URL for all API endpoints.
     * Uses environment variable with fallback to local API server.
     * Set VITE_API_BASE_URL in your .env file if needed.
     */
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000",

    /**
     * Common headers can be added here later.
     * Leave content-type unset so fetchBaseQuery can handle JSON bodies and
     * the browser can set multipart boundaries for FormData uploads.
     */
  }),

  /**
   * Define tag types for cache invalidation.
   * When you invalidate a tag, all queries with that tag are refetched.
   *
   * @example
   * ```typescript
   * // In an endpoint
   * providesTags: ['User']
   *
   * // In a mutation
   * invalidatesTags: ['User']
   * ```
   */
  tagTypes: ["Document-processing", "Document-content", "Document-extraction"],

  /**
   * Base endpoints object.
   * Empty by default - feature slices inject their own endpoints.
   */
  endpoints: () => ({}),
});

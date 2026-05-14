import { rootApi } from "@/store/rootApi";

export type CreateDocumentBatchRequest = FormData;

export type CreateDocumentBatchResponse = unknown;

export const dashboardApi = rootApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createDocumentBatch: builder.mutation<
      CreateDocumentBatchResponse,
      CreateDocumentBatchRequest
    >({
      query: (body) => ({
        url: "/document-batches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Document-processing"],
    }),
  }),
});

export const { useCreateDocumentBatchMutation } = dashboardApi;

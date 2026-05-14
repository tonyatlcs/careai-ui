import { rootApi } from "@/store/rootApi";

export type CreateDocumentBatchRequest = FormData;

export type CreateDocumentBatchResponse = {
  status: "accepted";
  batch: {
    id: string;
    documentCount: number;
    documents: Array<{ id: string; filename: string; mimetype: string }>;
  };
  /** Legacy/alternate shapes kept for compatibility if the API changes. */
  documentIds?: string[];
  documents?: Array<{ id: string }>;
};

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

import { rootApi } from "@/store/rootApi";

export type DocumentProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type DocumentListItem = {
  id: string;
  name: string;
  createdAt: string;
  patient?: string;
  category?: string;
  progress: number;
  status: DocumentProcessingStatus;
};

export type ListDocumentsParams = {
  page: number;
  limit?: number;
};

export type ListDocumentsResponse = {
  documentIds: string[];
  documents: DocumentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/** Prefer API `documentIds` when present; otherwise derive from list rows. */
export function documentIdsFromListData(
  data: ListDocumentsResponse | undefined,
): string[] {
  if (data == null) {
    return [];
  }
  if (Array.isArray(data.documentIds) && data.documentIds.length > 0) {
    return data.documentIds;
  }
  return data.documents.map((doc) => doc.id).filter((id): id is string => Boolean(id));
}

export type ProcessDocumentsRequest = {
  documentIds: string[];
};

export type ProcessDocumentsResponse = unknown;

export const documentsApi = rootApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    listDocuments: builder.query<ListDocumentsResponse, ListDocumentsParams>({
      query: ({ page, limit = 13 }) => ({
        url: "/documents",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _error, { page, limit = 13 }) => [
        { type: "Document-processing", id: `LIST-${page}-${limit}` },
        { type: "Document-processing", id: "LIST" },
      ],
    }),

    processDocuments: builder.mutation<
      ProcessDocumentsResponse,
      ProcessDocumentsRequest
    >({
      query: (body) => ({
        url: "/documents/process",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Document-processing"],
    }),
  }),
});

export const { useListDocumentsQuery, useProcessDocumentsMutation } =
  documentsApi;

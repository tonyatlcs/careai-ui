import { rootApi } from "@/store/rootApi";

export type DocumentProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type DocumentListItem = {
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
  documents: DocumentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const documentsApi = rootApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    listDocuments: builder.query<ListDocumentsResponse, ListDocumentsParams>({
      query: ({ page, limit = 20 }) => ({
        url: "/documents",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _error, { page, limit = 20 }) => [
        { type: "Document-processing", id: `LIST-${page}-${limit}` },
        { type: "Document-processing", id: "LIST" },
      ],
    }),
  }),
});

export const { useListDocumentsQuery } = documentsApi;

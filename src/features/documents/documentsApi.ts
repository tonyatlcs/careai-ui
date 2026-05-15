import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { rootApi } from "@/store/rootApi";
import type {
  ExtractionFields,
  GetDocumentContentResponse,
  GetDocumentExtractionResponse,
  PatchDocumentExtractionResponse,
} from "@/features/documents/documentContentTypes";
import { appendProcessingDocumentIds } from "@/features/documents/documentsSlice";

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
  /** 0–100 when present; null when no OCR confidence is available. */
  confidence: number | null;
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
  return data.documents
    .map((doc) => doc.id)
    .filter((id): id is string => Boolean(id));
}

export type ProcessDocumentsRequest = {
  documentIds: string[];
};

export type ProcessDocumentsResponse = unknown;

export type PatchDocumentExtractionRequest = {
  documentId: string;
  body: ExtractionFields;
};

export const documentsApi = rootApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    listDocuments: builder.query<ListDocumentsResponse, ListDocumentsParams>({
      query: ({ page, limit = 13 }) => ({
        url: "/documents",
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (
        response: Omit<ListDocumentsResponse, "documentIds"> & {
          documentIds?: string[];
        },
      ): ListDocumentsResponse => ({
        ...response,
        documentIds: documentIdsFromListData({
          ...response,
          documentIds: response.documentIds ?? [],
        }),
      }),
      providesTags: (_result, _error, { page, limit = 13 }) => [
        { type: "Document-processing", id: `LIST-${page}-${limit}` },
        { type: "Document-processing", id: "LIST" },
      ],
    }),

    getDocumentContent: builder.query<GetDocumentContentResponse, string>({
      query: (documentId) => `/documents/${documentId}/content`,
      providesTags: (_result, _error, documentId) => [
        { type: "Document-content", id: documentId },
        { type: "Document-processing", id: `CONTENT-${documentId}` },
      ],
    }),

    getDocumentExtraction: builder.query<
      GetDocumentExtractionResponse | null,
      string
    >({
      async queryFn(documentId, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/documents/${documentId}/extraction`,
          method: "GET",
        });
        if (result.error) {
          const err = result.error as FetchBaseQueryError;
          if (err.status === 404) {
            return { data: null };
          }
          return { error: result.error };
        }
        return { data: result.data as GetDocumentExtractionResponse };
      },
      providesTags: (_result, _error, documentId) => [
        { type: "Document-extraction", id: documentId },
        { type: "Document-processing", id: `CONTENT-${documentId}` },
      ],
    }),

    getDocumentFileBlob: builder.query<Blob, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}/file`,
        method: "GET",
        responseHandler: async (response: Response) => {
          if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(text || `HTTP ${response.status}`);
          }
          return response.blob();
        },
      }),
      providesTags: (_result, _error, documentId) => [
        { type: "Document-content", id: `${documentId}-file` },
      ],
    }),

    patchDocumentExtraction: builder.mutation<
      PatchDocumentExtractionResponse,
      PatchDocumentExtractionRequest
    >({
      query: ({ documentId, body }) => ({
        url: `/documents/${documentId}/extraction`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ documentId }, { dispatch, queryFulfilled }) {
        try {
          const { data: saved } = await queryFulfilled;

          const extractionSnapshot: GetDocumentExtractionResponse = {
            documentId: saved.documentId,
            status: saved.status,
            name: saved.name,
            reportDate: saved.reportDate,
            subject: saved.subject,
            contactSource: saved.contactSource,
            issueUser: saved.issueUser,
            category: saved.category,
            boxesAvailable: saved.boxesAvailable,
            fieldBoxes: saved.fieldBoxes,
          };

          dispatch(
            documentsApi.util.updateQueryData(
              "getDocumentContent",
              documentId,
              (draft) => {
                draft.status = saved.status;
                draft.boxesAvailable = saved.boxesAvailable;
                draft.fieldBoxes = saved.fieldBoxes;
                draft.extraction = {
                  name: saved.name,
                  reportDate: saved.reportDate,
                  subject: saved.subject,
                  contactSource: saved.contactSource,
                  issueUser: saved.issueUser,
                  category: saved.category,
                };
              },
            ),
          );

          dispatch(
            documentsApi.util.upsertQueryData(
              "getDocumentExtraction",
              documentId,
              extractionSnapshot,
            ),
          );
        } catch {
          // Failed saves are surfaced through the mutation state; leave cached content unchanged.
        }
      },
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: "Document-extraction", id: documentId },
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
      async onQueryStarted({ documentIds }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(appendProcessingDocumentIds(documentIds));
        } catch {
          // Failed requests are not tracked for the completion bubble.
        }
      },
      invalidatesTags: ["Document-processing"],
    }),
  }),
});

export const {
  useListDocumentsQuery,
  useGetDocumentContentQuery,
  useGetDocumentExtractionQuery,
  useGetDocumentFileBlobQuery,
  usePatchDocumentExtractionMutation,
  useProcessDocumentsMutation,
} = documentsApi;

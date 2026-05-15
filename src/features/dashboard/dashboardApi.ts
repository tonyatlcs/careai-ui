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

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

export type UploadDocumentBatchOptions = {
  body: CreateDocumentBatchRequest;
  onProgress?: (progress: number) => void;
};

export function uploadDocumentBatch({
  body,
  onProgress,
}: UploadDocumentBatchOptions): Promise<CreateDocumentBatchResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${apiBaseUrl}/document-batches`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      onProgress?.(
        Math.min(
          100,
          Math.max(0, Math.round((event.loaded / event.total) * 100)),
        ),
      );
    };

    xhr.onload = () => {
      const response =
        typeof xhr.response === "string"
          ? JSON.parse(xhr.response)
          : xhr.response;

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(response as CreateDocumentBatchResponse);
        return;
      }

      reject(new Error(`Upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.send(body);
  });
}

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

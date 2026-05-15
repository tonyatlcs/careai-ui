import {
  Dropzone,
  type DropzoneProps,
} from "@/components/elements/Dropzone/Dropzone";
import {
  type CreateDocumentBatchResponse,
  uploadDocumentBatch,
} from "@/features/dashboard/dashboardApi";
import { useCallback, useState } from "react";

/** Dashboard document picker; wraps the shared {@link Dropzone} with the same API. */
export type DocumentDropzoneProps = DropzoneProps & {
  /** Fires after the batch upload request finishes (success or failure). */
  onUploadSettled?: (info: {
    ok: boolean;
    files: File[];
    response?: CreateDocumentBatchResponse;
  }) => void;
  /** Reports aggregate multipart upload progress for the accepted files. */
  onUploadProgress?: (info: { files: File[]; progress: number }) => void;
};

export function DocumentDropzone({
  onDrop,
  onUploadSettled,
  onUploadProgress,
  disabled,
  ...dropzoneProps
}: DocumentDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = useCallback<NonNullable<DropzoneProps["onDrop"]>>(
    (acceptedFiles, fileRejections) => {
      onDrop?.(acceptedFiles, fileRejections);

      if (acceptedFiles.length === 0) {
        return;
      }

      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append("files", file);
      });

      setIsUploading(true);
      onUploadProgress?.({ files: acceptedFiles, progress: 0 });

      void uploadDocumentBatch({
        body: formData,
        onProgress: (progress) => {
          onUploadProgress?.({ files: acceptedFiles, progress });
        },
      })
        .then((response) => {
          onUploadSettled?.({ ok: true, files: acceptedFiles, response });
        })
        .catch(() => {
          onUploadSettled?.({ ok: false, files: acceptedFiles });
        })
        .finally(() => {
          setIsUploading(false);
        });
    },
    [onDrop, onUploadProgress, onUploadSettled],
  );

  return (
    <Dropzone
      {...dropzoneProps}
      disabled={disabled || isUploading}
      onDrop={handleDrop}
    />
  );
}

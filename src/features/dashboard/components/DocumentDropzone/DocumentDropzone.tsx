import {
  Dropzone,
  type DropzoneProps,
} from "@/components/elements/Dropzone/Dropzone";
import { useCreateDocumentBatchMutation } from "@/features/dashboard/dashboardApi";
import { useCallback } from "react";

/** Dashboard document picker; wraps the shared {@link Dropzone} with the same API. */
export type DocumentDropzoneProps = DropzoneProps & {
  /** Fires after the batch upload request finishes (success or failure). */
  onUploadSettled?: (info: { ok: boolean; files: File[] }) => void;
};

export function DocumentDropzone({
  onDrop,
  onUploadSettled,
  disabled,
  ...dropzoneProps
}: DocumentDropzoneProps) {
  const [createDocumentBatch, { isLoading }] = useCreateDocumentBatchMutation();

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

      void createDocumentBatch(formData)
        .unwrap()
        .then(() => {
          onUploadSettled?.({ ok: true, files: acceptedFiles });
        })
        .catch(() => {
          onUploadSettled?.({ ok: false, files: acceptedFiles });
        });
    },
    [createDocumentBatch, onDrop, onUploadSettled],
  );

  return (
    <Dropzone
      {...dropzoneProps}
      disabled={disabled || isLoading}
      onDrop={handleDrop}
    />
  );
}

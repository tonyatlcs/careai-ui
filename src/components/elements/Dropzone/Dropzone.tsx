import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./Dropzone.module.scss";
import { formatMaxSizeLabel } from "./utils/formatSizeLabel";

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

/** MIME map for PDF, JPG, PNG, DOCX */
export const DOCUMENT_DROPZONE_ACCEPT: Accept = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export type DropzoneProps = {
  /** Called with accepted files and any rejections after a drop or browse selection. */
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
  /** Max file size in bytes. Default 50MB. */
  maxSize?: number;
  /** Override accepted MIME types. Defaults to PDF, JPG, PNG, DOCX. */
  accept?: Accept;
  disabled?: boolean;
  className?: string;
};

export function Dropzone({
  onDrop,
  maxSize = DEFAULT_MAX_BYTES,
  accept = DOCUMENT_DROPZONE_ACCEPT,
  disabled = false,
  className,
}: DropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      onDrop?.(acceptedFiles, fileRejections);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
    multiple: true,
    disabled,
    noKeyboard: false,
  });

  return (
    <div
      {...getRootProps({
        className: cn(
          styles.root,
          isDragActive && styles.rootDragActive,
          disabled && styles.rootDisabled,
          className,
        ),
      })}
    >
      <input {...getInputProps()} />

      <div className={styles.iconWrap} aria-hidden>
        <Upload className={styles.uploadIcon} strokeWidth={2} />
      </div>

      <div className={styles.copy}>
        <p className={styles.title}>Click to browse or drag and drop</p>
        <p className={styles.hint}>
          Supported formats: PDF, JPG, PNG, DOCX (Max{" "}
          {formatMaxSizeLabel(maxSize)})
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="default"
        className={styles.browseButton}
      >
        <span>Browse Files</span>
      </Button>
    </div>
  );
}

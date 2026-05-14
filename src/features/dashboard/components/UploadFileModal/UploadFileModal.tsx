import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentDropzone } from "@/features/dashboard/components/DocumentDropzone/DocumentDropzone";
import { FileInfoRow } from "@/features/dashboard/components/FileInfoRow/FileInfoRow";
import { setFileCount } from "@/features/dashboard/dashboardSlice";
import type { CreateDocumentBatchResponse } from "@/features/dashboard/dashboardApi";
import { setDocumentIds } from "@/features/documents/documentsSlice";
import type { AppDispatch, RootState } from "@/store";
import { CloudUpload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./UploadFileModal.module.scss";
import {
  fileKey,
  fileKindForName,
  formatFileSize,
  type UploadRow,
} from "./utils/FileModal.util";
import { Pill } from "@/components/elements/Pill/Pill";

type UploadFileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Invoked when the user selects one or more valid files (PDF, JPG, PNG, DOCX, within size limit). */
  onUpload?: (files: File[]) => void;
};

const getUploadedDocumentIds = (
  response?: CreateDocumentBatchResponse,
): string[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.documentIds)) {
    return response.documentIds;
  }

  if (Array.isArray(response.documents)) {
    return response.documents.map(({ id }) => id);
  }

  return [];
};

export function UploadFileModal({
  open,
  onOpenChange,
  onUpload,
}: UploadFileModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const fileCount = useSelector(
    (state: RootState) => state.dashboard.fileCount,
  );
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [sharedProgress, setSharedProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setSharedProgress(0);
    }
  }, [open]);

  useEffect(() => {
    dispatch(setFileCount(rows.length));
  }, [dispatch, rows.length]);

  const uploadingPaused = rows.some(
    (r) => r.status === "uploading" && r.paused,
  );

  useEffect(() => {
    const hasUploading = rows.some((r) => r.status === "uploading");
    if (!hasUploading || uploadingPaused) {
      return;
    }

    const id = window.setInterval(() => {
      setSharedProgress((p) => (p >= 92 ? p : Math.min(92, p + 4)));
    }, 160);

    return () => window.clearInterval(id);
  }, [rows, uploadingPaused]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }
      onUpload?.(acceptedFiles);
      setSharedProgress(0);
      setRows((prev) => [
        ...prev,
        ...acceptedFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          status: "uploading" as const,
          paused: false,
        })),
      ]);
    },
    [onUpload],
  );

  const handleUploadSettled = useCallback(
    (info: {
      ok: boolean;
      files: File[];
      response?: CreateDocumentBatchResponse;
    }) => {
      const touched = new Set(info.files.map((f) => fileKey(f)));
      const uploadedDocumentIds = getUploadedDocumentIds(info.response);

      if (info.ok && uploadedDocumentIds.length > 0) {
        dispatch(setDocumentIds(uploadedDocumentIds));
      }

      setSharedProgress(100);
      setRows((prev) =>
        prev.map((row) => {
          if (!touched.has(fileKey(row.file))) {
            return row;
          }
          if (row.status !== "uploading") {
            return row;
          }
          return {
            ...row,
            status: info.ok ? ("complete" as const) : ("error" as const),
          };
        }),
      );
    },
    [dispatch],
  );

  const togglePause = useCallback((rowId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, paused: !row.paused } : row,
      ),
    );
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.modalContent} showCloseButton={false}>
        <DialogHeader className={styles.header}>
          <div className={styles.iconWrap}>
            <CloudUpload className={styles.headerIcon} aria-hidden="true" />
          </div>

          <div className={styles.headerCopy}>
            <DialogTitle className={styles.title}>Upload Documents</DialogTitle>
            <DialogDescription className={styles.description}>
              Add patient records, lab results, or imaging.
            </DialogDescription>
          </div>

          <DialogClose className={styles.closeButton} aria-label="Close">
            <X className={styles.closeIcon} aria-hidden="true" />
          </DialogClose>
        </DialogHeader>

        <div className={styles.body}>
          <DocumentDropzone
            onDrop={handleDrop}
            onUploadSettled={handleUploadSettled}
          />

          {rows.length > 0 ? (
            <div className={styles.fileSection}>
              <div className={styles.rowHeadingContainer}>
                <h3 className={styles.rowHeading}>Uploading files</h3>
                <Pill className={styles.fileCountPill} variant="neutral">
                  {fileCount} {fileCount > 1 ? "files" : "file"}
                </Pill>
              </div>

              <ul className={styles.fileList} aria-label="Selected files">
                {rows.map((row) => {
                  const progressValue =
                    row.status === "complete"
                      ? 100
                      : row.status === "error"
                        ? 0
                        : Math.round(sharedProgress);

                  return (
                    <li key={row.id} className={styles.fileListItem}>
                      <FileInfoRow
                        fileName={row.file.name}
                        sizeLabel={formatFileSize(row.file.size)}
                        progress={progressValue}
                        status={row.status}
                        paused={row.paused}
                        fileKind={fileKindForName(row.file.name)}
                        onPauseToggle={
                          row.status === "uploading"
                            ? () => togglePause(row.id)
                            : undefined
                        }
                        onCancel={() => removeRow(row.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <DialogFooter className={styles.footer}>
          <Button
            type="button"
            className={styles.uploadButton}
            disabled={rows.length === 0}
            onClick={() => {
              onOpenChange(false);
              navigate("/documents");
            }}
          >
            Upload Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

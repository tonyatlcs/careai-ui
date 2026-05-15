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
import {
  dashboardApi,
  type CreateDocumentBatchResponse,
} from "@/features/dashboard/dashboardApi";
import { documentsApi } from "@/features/documents/documentsApi";
import { removeDocumentId, setDocumentIds } from "@/features/documents/documentsSlice";
import type { AppDispatch, RootState } from "@/store";
import { CloudUpload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
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

  const fromBatch = response.batch?.documents;
  if (Array.isArray(fromBatch) && fromBatch.length > 0) {
    return fromBatch.map(({ id }) => id);
  }

  if (Array.isArray(response.documentIds)) {
    return response.documentIds;
  }

  if (Array.isArray(response.documents)) {
    return response.documents.map(({ id }) => id);
  }

  return [];
};

type BatchDocumentRef = { id: string; filename: string };

const orderedDocumentsFromBatchResponse = (
  response: CreateDocumentBatchResponse,
  files: File[],
): BatchDocumentRef[] => {
  if (response.batch?.documents?.length) {
    return response.batch.documents.map((d) => ({
      id: d.id,
      filename: d.filename,
    }));
  }

  if (Array.isArray(response.documents)) {
    return response.documents.map((d, index) => ({
      id: d.id,
      filename: files[index]?.name ?? "",
    }));
  }

  if (Array.isArray(response.documentIds)) {
    return response.documentIds.map((id, index) => ({
      id,
      filename: files[index]?.name ?? "",
    }));
  }

  return [];
};

const mapFilesToUploadedDocumentIds = (
  files: File[],
  response?: CreateDocumentBatchResponse,
): Map<string, string> => {
  const map = new Map<string, string>();
  if (!response) {
    return map;
  }

  const ordered = orderedDocumentsFromBatchResponse(response, files);
  if (ordered.length === 0) {
    return map;
  }

  if (ordered.length === files.length) {
    for (let i = 0; i < files.length; i++) {
      map.set(fileKey(files[i]), ordered[i].id);
    }
    return map;
  }

  for (const file of files) {
    const match = ordered.find((d) => d.filename === file.name);
    if (match) {
      map.set(fileKey(file), match.id);
    }
  }

  return map;
};

export function UploadFileModal({
  open,
  onOpenChange,
  onUpload,
}: UploadFileModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const fileCount = useSelector(
    (state: RootState) => state.dashboard.fileCount,
  );
  const [rows, setRows] = useState<UploadRow[]>([]);

  useEffect(() => {
    if (!open) {
      setRows([]);
    }
  }, [open]);

  useEffect(() => {
    dispatch(setFileCount(rows.length));
  }, [dispatch, rows.length]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }
      onUpload?.(acceptedFiles);
      setRows((prev) => [
        ...prev,
        ...acceptedFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "uploading" as const,
          paused: false,
        })),
      ]);
    },
    [onUpload],
  );

  const handleUploadProgress = useCallback(
    (info: { files: File[]; progress: number }) => {
      const touched = new Set(info.files.map((f) => fileKey(f)));
      const progress = Math.min(100, Math.max(0, Math.round(info.progress)));

      setRows((prev) =>
        prev.map((row) =>
          touched.has(fileKey(row.file)) && row.status === "uploading"
            ? { ...row, progress }
            : row,
        ),
      );
    },
    [],
  );

  const handleUploadSettled = useCallback(
    (info: {
      ok: boolean;
      files: File[];
      response?: CreateDocumentBatchResponse;
    }) => {
      const touched = new Set(info.files.map((f) => fileKey(f)));
      const uploadedDocumentIds = getUploadedDocumentIds(info.response);
      const documentIdByFileKey = info.ok
        ? mapFilesToUploadedDocumentIds(info.files, info.response)
        : new Map<string, string>();

      if (info.ok && uploadedDocumentIds.length > 0) {
        const prev = store.getState().documents.documentIds;
        dispatch(
          setDocumentIds([
            ...new Set([...prev, ...uploadedDocumentIds]),
          ]),
        );
        dispatch(dashboardApi.util.invalidateTags(["Document-processing"]));
      }

      setRows((prev) =>
        prev.map((row) => {
          if (!touched.has(fileKey(row.file))) {
            return row;
          }
          if (row.status !== "uploading") {
            return row;
          }
          const documentId = documentIdByFileKey.get(fileKey(row.file));
          return {
            ...row,
            progress: info.ok ? 100 : row.progress,
            status: info.ok ? ("complete" as const) : ("error" as const),
            ...(info.ok && documentId ? { documentId } : {}),
          };
        }),
      );
    },
    [dispatch, store],
  );

  const togglePause = useCallback((rowId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, paused: !row.paused } : row,
      ),
    );
  }, []);

  const removeRow = useCallback(
    (rowId: string) => {
      let documentId: string | undefined;

      setRows((prev) => {
        const row = prev.find((r) => r.id === rowId);
        documentId = row?.documentId;
        return prev.filter((r) => r.id !== rowId);
      });

      if (documentId) {
        dispatch(removeDocumentId(documentId));
        void dispatch(documentsApi.endpoints.deleteDocument.initiate(documentId));
      }
    },
    [dispatch],
  );

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
            onUploadProgress={handleUploadProgress}
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
                        : row.progress;

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

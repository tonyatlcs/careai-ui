import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentDropzone } from "@/features/dashboard/components/DocumentDropzone/DocumentDropzone";
import { CloudUpload, X } from "lucide-react";
import { useCallback } from "react";
import styles from "./UploadFileModal.module.scss";

type UploadFileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Invoked when the user selects one or more valid files (PDF, JPG, PNG, DOCX, within size limit). */
  onUpload?: (files: File[]) => void;
};

export function UploadFileModal({
  open,
  onOpenChange,
  onUpload,
}: UploadFileModalProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload?.(acceptedFiles);
      }
    },
    [onUpload],
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
          <DocumentDropzone onDrop={handleDrop} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

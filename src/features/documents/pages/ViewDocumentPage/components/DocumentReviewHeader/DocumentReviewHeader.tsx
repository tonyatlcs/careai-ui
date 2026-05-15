import type { FC } from "react";
import { Link } from "react-router-dom";
import ctaStyles from "@/components/elements/sharedAppCtaButton.module.scss";
import { Button } from "@/components/ui/button";
import { formatDocumentsQueueBadgeCount } from "@/features/documents/pages/ViewDocumentPage/hooks/documentsQueuePolling";
import styles from "./DocumentReviewHeader.module.scss";
import { ChevronLeft } from "lucide-react";

export type DocumentReviewHeaderProps = {
  documentName: string | undefined;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled: boolean;
  patchLoading: boolean;
  /**
   * Session count of documents that finished processing while off the queue list;
   * shown in the full-screen viewer where the shell sidebar is not mounted.
   */
  queueCompletedCount?: number;
};

export const DocumentReviewHeader: FC<DocumentReviewHeaderProps> = ({
  documentName,
  onCancel,
  onSave,
  saveDisabled,
  patchLoading,
  queueCompletedCount = 0,
}) => (
  <header className={styles.header}>
    <div className={styles.headerMain}>
      <Button
        type="button"
        variant="outline"
        className={styles.backButton}
        aria-label="Back to documents"
        onClick={onCancel}
      >
        <ChevronLeft className={styles.backButtonIcon} aria-hidden />
      </Button>
      {queueCompletedCount > 0 ? (
        <Link
          to="/documents"
          className={styles.queueCompletedBadge}
          title="Open document queue"
          aria-label={`${queueCompletedCount} document${
            queueCompletedCount === 1 ? "" : "s"
          } finished processing — open queue`}
        >
          {formatDocumentsQueueBadgeCount(queueCompletedCount)}
        </Link>
      ) : null}
      <div className={styles.documentRow}>
        <p className={styles.fileName} title={documentName}>
          {documentName ?? "…"}
        </p>
        <h1 className={styles.title}>Document Review &amp; Approval</h1>
      </div>
    </div>
    <div className={styles.headerActions}>
      <Button
        className={styles.cancelButton}
        size="lg"
        type="button"
        variant="secondary"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        className={ctaStyles.appCtaButton}
        disabled={saveDisabled}
        size="lg"
        type="button"
        onClick={() => void onSave()}
      >
        {patchLoading ? "Saving…" : "Save"}
      </Button>
    </div>
  </header>
);

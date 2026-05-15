import type { FC } from "react";
import ctaStyles from "@/components/elements/sharedAppCtaButton.module.scss";
import { Button } from "@/components/ui/button";
import styles from "./DocumentReviewHeader.module.scss";
import { ChevronLeft } from "lucide-react";

export type DocumentReviewHeaderProps = {
  documentName: string | undefined;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled: boolean;
  patchLoading: boolean;
};

export const DocumentReviewHeader: FC<DocumentReviewHeaderProps> = ({
  documentName,
  onCancel,
  onSave,
  saveDisabled,
  patchLoading,
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

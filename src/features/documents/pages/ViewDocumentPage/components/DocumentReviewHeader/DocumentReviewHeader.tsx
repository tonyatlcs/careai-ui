import type { FC } from "react";
import { Button } from "@/components/ui/button";
import styles from "./DocumentReviewHeader.module.scss";

export type DocumentReviewHeaderProps = {
  documentName: string | undefined;
  onCancel: () => void;
  onSave: () => void;
  onConfirmNext: () => void;
  saveDisabled: boolean;
  confirmDisabled: boolean;
  patchLoading: boolean;
};

export const DocumentReviewHeader: FC<DocumentReviewHeaderProps> = ({
  documentName,
  onCancel,
  onSave,
  onConfirmNext,
  saveDisabled,
  confirmDisabled,
  patchLoading,
}) => (
  <header className={styles.header}>
    <div className={styles.headerMain}>
      <p className={styles.fileName} title={documentName}>
        {documentName ?? "…"}
      </p>
      <h1 className={styles.title}>Document Review &amp; Approval</h1>
    </div>
    <div className={styles.headerActions}>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        disabled={saveDisabled}
        type="button"
        variant="secondary"
        onClick={() => void onSave()}
      >
        {patchLoading ? "Saving…" : "Save"}
      </Button>
      <Button disabled={confirmDisabled} type="button" onClick={() => void onConfirmNext()}>
        Confirm &amp; Next
      </Button>
    </div>
  </header>
);

import type { FC } from "react";
import type { ContentBlock, GetDocumentContentResponse } from "@/features/documents/documentContentTypes";
import styles from "./TranscriptPanel.module.scss";

export type TranscriptPanelProps = {
  content: GetDocumentContentResponse;
  selectedPage: number;
  onSelectPage: (page: number) => void;
};

export const TranscriptPanel: FC<TranscriptPanelProps> = ({
  content,
  selectedPage,
  onSelectPage,
}) => {
  const blocks = content.content.blocks;
  if (blocks.length === 0) {
    return (
      <div className={styles.transcript}>
        <p className={styles.transcriptEmptyNote}>
          {content.content.text || "No OCR text available."}
        </p>
      </div>
    );
  }
  const byPage = new Map<number, ContentBlock[]>();
  for (const b of blocks) {
    const list = byPage.get(b.page) ?? [];
    list.push(b);
    byPage.set(b.page, list);
  }
  const orderedPages = [...byPage.keys()].sort((a, b) => a - b);
  return (
    <div className={styles.transcript}>
      {orderedPages.map((p) => (
        <div className={styles.transcriptPage} key={p}>
          <p className={styles.transcriptPageTitle}>Page {p}</p>
          {(byPage.get(p) ?? []).map((b) => (
            <p
              className={`${styles.transcriptBlock} ${selectedPage === p ? styles.transcriptBlockActive : ""}`}
              key={b.id}
              onClick={() => onSelectPage(p)}
              role="presentation"
            >
              {b.text}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

import type { FC } from "react";
import { categoryDisplayLabels } from "@/features/documents/Components/DocumentsTable/DocumentTypes";
import {
  EXTRACTION_FIELD_KEYS,
  type ExtractionFieldKey,
  type ExtractionFields,
  type GetDocumentContentResponse,
} from "@/features/documents/documentContentTypes";
import {
  CATEGORY_OPTIONS,
  FIELD_LABELS,
  STORE_IN_OPTIONS,
  confidenceLabelForField,
  isWarnConfidence,
} from "@/features/documents/pages/ViewDocumentPage/utils/viewDocumentPageUtils";
import styles from "./ExtractionPanel.module.scss";

export type ExtractionPanelProps = {
  content: GetDocumentContentResponse;
  form: ExtractionFields;
  focusedField: ExtractionFieldKey | null;
  hoveredField: ExtractionFieldKey | null;
  onFieldFocus: (field: ExtractionFieldKey) => void;
  onUpdateField: (key: ExtractionFieldKey, value: string) => void;
};

export const ExtractionPanel: FC<ExtractionPanelProps> = ({
  content,
  form,
  focusedField,
  hoveredField,
  onFieldFocus,
  onUpdateField,
}) => (
  <>
    {EXTRACTION_FIELD_KEYS.map((field) => {
      const noBox = content.fieldBoxes[field].length === 0;
      const confLabel = confidenceLabelForField(field, content.fieldBoxes);
      const warnBadge =
        confLabel === "Unknown" ||
        (() => {
          const boxes = content.fieldBoxes[field];
          if (boxes.length === 0) {
            return true;
          }
          return boxes.some((b) => isWarnConfidence(b.confidence));
        })();
      const isFocused = focusedField === field;
      const isHovered = hoveredField === field;
      return (
        <div
          className={`${styles.fieldBlock} ${isFocused || isHovered ? styles.fieldFocused : ""}`}
          key={field}
        >
          <div className={styles.fieldLabelRow}>
            <span className={styles.fieldLabel}>{FIELD_LABELS[field]}</span>
            <span
              className={`${styles.badge} ${warnBadge ? styles.badgeWarn : ""}`}
            >
              {confLabel}
            </span>
          </div>
          {field === "category" ? (
            <select
              className={styles.select}
              value={form.category}
              onChange={(e) => onUpdateField("category", e.target.value)}
              onFocus={() => onFieldFocus(field)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {categoryDisplayLabels[opt]}
                </option>
              ))}
            </select>
          ) : field === "storeIn" ? (
            <select
              className={styles.select}
              value={form.storeIn}
              onChange={(e) => onUpdateField("storeIn", e.target.value)}
              onFocus={() => onFieldFocus(field)}
            >
              {STORE_IN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field === "subject" ||
            field === "contactSource" ||
            field === "issueUser" ? (
            <textarea
              className={styles.textarea}
              value={form[field]}
              onChange={(e) => onUpdateField(field, e.target.value)}
              onFocus={() => onFieldFocus(field)}
            />
          ) : (
            <input
              className={styles.input}
              type="text"
              value={form[field]}
              onChange={(e) => onUpdateField(field, e.target.value)}
              onFocus={() => onFieldFocus(field)}
            />
          )}
          <span className={styles.fieldMeta}>
            {noBox
              ? "No source box"
              : `Evidence: ${content.fieldBoxes[field].length} region(s)`}
          </span>
        </div>
      );
    })}
  </>
);

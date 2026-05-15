import type { FC, RefObject } from "react";
import type { ExtractionFieldKey, FieldBoxes } from "@/features/documents/documentContentTypes";
import { boxesOnPage, isWarnConfidence } from "@/features/documents/pages/ViewDocumentPage/viewDocumentPageUtils";
import styles from "./FieldBoxLayer.module.scss";

export type FieldBoxLayerProps = {
  fieldBoxes: FieldBoxes;
  space: { width: number; height: number };
  page: number;
  focusedField: ExtractionFieldKey | null;
  boxAnchorRef: RefObject<HTMLDivElement | null>;
  onHoverField: (field: ExtractionFieldKey | null) => void;
};

export const FieldBoxLayer: FC<FieldBoxLayerProps> = ({
  fieldBoxes,
  space,
  page,
  focusedField,
  boxAnchorRef,
  onHoverField,
}) => {
  const items = boxesOnPage(fieldBoxes, page);
  return items.map(({ field, box, index }) => {
    const selected = focusedField === field;
    const warn = isWarnConfidence(box.confidence);
    const key = `${field}-${index}-${box.page}`;
    return (
      <div
        className={`${styles.box} ${warn ? styles.boxWarn : ""} ${selected ? styles.boxSelected : ""}`}
        key={key}
        ref={selected && focusedField === field && index === 0 ? boxAnchorRef : undefined}
        style={{
          left: `${(box.x / space.width) * 100}%`,
          top: `${(box.y / space.height) * 100}%`,
          width: `${(box.width / space.width) * 100}%`,
          height: `${(box.height / space.height) * 100}%`,
        }}
        onMouseEnter={() => onHoverField(field)}
        onMouseLeave={() => onHoverField(null)}
      />
    );
  });
};

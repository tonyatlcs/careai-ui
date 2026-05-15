import { categoryDisplayLabels } from "@/features/documents/Components/DocumentsTable/DocumentTypes";
import {
  EXTRACTION_FIELD_KEYS,
  type ContentBlock,
  type ExtractionFieldKey,
  type FieldBox,
  type FieldBoxes,
  type GetDocumentContentResponse,
} from "@/features/documents/documentContentTypes";

/**
 * PDF OCR runs on raster pages from `getScreenshot({ scale: N })` in careai-core-api
 * `extract-text.ts`. Bboxes are in that full raster space — not the tight union of line boxes.
 */
export const PDF_SCREENSHOT_OCR_SCALE = 2;

/** Warn when normalized confidence is below this (0–100 scale, ~70%). */
export const CONFIDENCE_WARN_MIN_PERCENT = 70;

/**
 * Maps stored OCR confidence to a 0–100 value. Tesseract line confidence is 0–100;
 * values in [0, 1] are treated as fractions; values in (100, 10_000] heal a mistaken ×100.
 */
export function confidencePercentFromStored(raw: number): number {
  let v = raw;
  if (v >= 0 && v <= 1) {
    v *= 100;
  } else if (v > 100 && v <= 10_000) {
    v /= 100;
  }
  return Math.min(100, Math.max(0, v));
}

export const FIELD_LABELS: Record<ExtractionFieldKey, string> = {
  name: "Patient name",
  reportDate: "Report date",
  subject: "Subject",
  contactSource: "Contact source",
  issueUser: "Issue / user",
  category: "Category",
};

export function confidenceLabelForField(
  field: ExtractionFieldKey,
  fieldBoxes: FieldBoxes,
): string {
  const boxes = fieldBoxes[field];
  if (boxes.length === 0) {
    return "Unknown";
  }
  const values = boxes.map((b) => b.confidence).filter((c) => c != null) as number[];
  if (values.length === 0) {
    return "Unknown";
  }
  const minPct = Math.min(...values.map(confidencePercentFromStored));
  return `${Math.round(minPct)}%`;
}

export function isWarnConfidence(confidence: number | null): boolean {
  if (confidence == null) {
    return true;
  }
  return confidencePercentFromStored(confidence) < CONFIDENCE_WARN_MIN_PERCENT;
}

export function pagesFromContent(data: GetDocumentContentResponse): number[] {
  const pages = new Set<number>();
  for (const b of data.content.blocks) {
    pages.add(b.page);
  }
  for (const key of EXTRACTION_FIELD_KEYS) {
    for (const box of data.fieldBoxes[key]) {
      pages.add(box.page);
    }
  }
  if (pages.size === 0) {
    pages.add(1);
  }
  return [...pages].sort((a, b) => a - b);
}

export function inferPageSpace(
  page: number,
  blocks: ContentBlock[],
  fieldBoxes: FieldBoxes,
): { width: number; height: number } {
  let maxX = 1;
  let maxY = 1;
  for (const b of blocks) {
    if (b.page !== page) {
      continue;
    }
    maxX = Math.max(maxX, b.bbox.x + b.bbox.width);
    maxY = Math.max(maxY, b.bbox.y + b.bbox.height);
  }
  for (const key of EXTRACTION_FIELD_KEYS) {
    for (const bx of fieldBoxes[key]) {
      if (bx.page !== page) {
        continue;
      }
      maxX = Math.max(maxX, bx.x + bx.width);
      maxY = Math.max(maxY, bx.y + bx.height);
    }
  }
  return { width: maxX, height: maxY };
}

export function boxesOnPage(
  fieldBoxes: FieldBoxes,
  page: number,
): { field: ExtractionFieldKey; box: FieldBox; index: number }[] {
  const out: { field: ExtractionFieldKey; box: FieldBox; index: number }[] = [];
  for (const field of EXTRACTION_FIELD_KEYS) {
    fieldBoxes[field].forEach((box, index) => {
      if (box.page === page) {
        out.push({ field, box, index });
      }
    });
  }
  return out;
}

export function firstBoxPageForField(
  fieldBoxes: FieldBoxes,
  field: ExtractionFieldKey,
): number | null {
  const b = fieldBoxes[field][0];
  return b ? b.page : null;
}

export const CATEGORY_OPTIONS = Object.keys(categoryDisplayLabels) as (keyof typeof categoryDisplayLabels)[];

export const PREVIEW_PAD = 28;

export function previewInnerSize(width: number, height: number): { w: number; h: number } {
  return {
    w: Math.max(80, width - PREVIEW_PAD),
    h: Math.max(80, height - PREVIEW_PAD),
  };
}

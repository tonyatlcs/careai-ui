/** Mirrors `GetDocumentContentResponse` from careai-core-api. `extraction` is duplicated on
 *  `GET /documents/:id/extraction` (DB `document_extractions`); the review UI loads field values from that route.
 */

export type DocumentKind = "pdf" | "docx" | "jpg" | "png";

export type DocumentProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type FieldBox = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceBlockId: string;
  text: string;
  confidence: number | null;
};

export type FieldBoxes = {
  name: FieldBox[];
  reportDate: FieldBox[];
  subject: FieldBox[];
  contactSource: FieldBox[];
  issueUser: FieldBox[];
  category: FieldBox[];
  storeIn: FieldBox[];
};

export type ContentBlock = {
  id: string;
  page: number;
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number | null;
  source: "tesseract_ocr";
};

export type ExtractionFields = {
  name: string;
  reportDate: string;
  subject: string;
  contactSource: string;
  issueUser: string;
  category: string;
  storeIn: "Correspondence" | "Investigations";
};

export type GetDocumentContentResponse = {
  documentId: string;
  documentName: string;
  mimeType: string;
  documentKind: DocumentKind;
  status: DocumentProcessingStatus;
  boxesAvailable: boolean;
  content: { text: string; blocks: ContentBlock[] };
  extraction: ExtractionFields | null;
  fieldBoxes: FieldBoxes;
};

export type PatchDocumentExtractionResponse = ExtractionFields & {
  documentId: string;
  status: DocumentProcessingStatus;
  boxesAvailable: boolean;
  fieldBoxes: FieldBoxes;
};

/** Same payload shape as PATCH /documents/:id/extraction (DB `document_extractions` row + derived boxes). */
export type GetDocumentExtractionResponse = PatchDocumentExtractionResponse;

export const EXTRACTION_FIELD_KEYS = [
  "name",
  "reportDate",
  "subject",
  "contactSource",
  "issueUser",
  "category",
  "storeIn",
] as const;

export type ExtractionFieldKey = (typeof EXTRACTION_FIELD_KEYS)[number];

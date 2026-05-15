# Hybrid Document Review & Approval Page

## Summary

Build a full `View document` workflow for selected documents. Clicking `View document` opens `/documents/:id`, displays that specific document, overlays extracted-field bounding boxes on every supported document view, lets users edit extracted fields, and advances through the current document list with `Confirm & Next`.

## Key Changes

- Add `/documents/:documentId` routing for `ViewDocumentPage`.
- Update the documents table `View document` action to navigate using the clicked row id.
- Use `documentsSlice.documentIds` as the review sequence for `Confirm & Next`.
- Add `GET /documents/:id/file` in the API to stream the original S3 object stored under `document.id`.
- Add `PATCH /documents/:id/extraction` in the API to save edits to `name`, `reportDate`, `subject`, `contactSource`, `issueUser`, and `category`.
- Add RTK Query endpoints for document content loading and extraction updates.

## Review Page UI

- Header contains the document filename, `Document Review & Approval`, `Cancel`, `Save`, and `Confirm & Next`.
- Left rail shows page thumbnails and page numbers.
- Center area contains the document toolbar and preview.
- Right panel is titled `Extracted Data` and contains editable extracted fields.
- Toolbar includes page indicator, undo, redo, delete, draw, highlight, add text, sign, search, and zoom controls.
- Annotation controls are visual placeholders in this version.

## Preview Behavior

- PDF documents render using the original file preview from `/documents/:id/file`.
- PNG and JPG documents render as images from `/documents/:id/file`.
- DOCX documents and failed original previews fall back to OCR content.
- OCR fallback uses a split page/text layout:
  - Document-like pages render OCR blocks when bounding boxes are available.
  - A selectable transcript groups extracted text by page.
  - If OCR blocks are unavailable, show `content.text` as the transcript.
- Loading, error, pending, processing, failed, missing document, and empty OCR states are explicit.

## Bounding Boxes

- Field-level bounding boxes from `fieldBoxes` are visible on every document by default.
- Boxes appear on PDF, image, and OCR fallback previews.
- Do not show every OCR text block box by default.
- Clicking or focusing a field in the right panel highlights its matching boxes.
- Selecting a field scrolls the preview to the first matching page and box.
- Hovering a box highlights the corresponding field in the side panel.
- Missing boxes show `No source box` beside that field.
- Unknown confidence displays as `Unknown`.
- Low or unknown confidence boxes use a warning style.
- Selected boxes use a stronger outline.
- Overlay coordinates scale from the document page coordinate system to the rendered preview size.

## Extracted Data Panel

- Editable fields:
  - `name`
  - `reportDate`
  - `subject`
  - `contactSource`
  - `issueUser`
  - `category`
- Category uses the existing document category labels.
- Confidence badges are computed from matching `fieldBoxes[field].confidence` values.
- Dirty state enables `Save`.
- `Confirm & Next` saves dirty edits before navigation.
- Confidence, evidence, and field boxes remain read-only.

## Batch Flow

- `Cancel` returns to `/documents`.
- `Save` persists edits and stays on the current document.
- `Confirm & Next` saves edits, then navigates to the next id in `documentsSlice.documentIds`.
- If there is no next id, return to `/documents`.
- If the current id is not in the stored sequence, return to `/documents` after confirm.

## API Details

- `GET /documents/:id/file`
  - Streams the original S3 object.
  - Sets `Content-Type` from `Documents.mimeType`.
  - Sets `Content-Disposition: inline; filename="<document.name>"`.
  - Returns `404` for missing records or missing S3 objects.

- `PATCH /documents/:id/extraction`
  - Updates the existing `document_extractions` row.
  - Returns `404` if the document or extraction does not exist.
  - Returns the updated extraction payload in the same shape used by the content/extraction endpoints.
  - Does not update field evidence, OCR blocks, or confidence data.

## Test Cases

- Run `npm run build` in `careai-ui`.
- Verify `View document` opens the selected document id.
- Verify PDF and image previews load with field-box overlays.
- Verify DOCX or unsupported previews show OCR fallback with field-box overlays.
- Verify right-panel field focus highlights matching boxes and scrolls to them.
- Verify box hover highlights the matching field.
- Verify missing boxes and unknown confidence render cleanly.
- Verify edited fields save through `PATCH /documents/:id/extraction`.
- Verify `Confirm & Next` advances through document ids and exits at the end.

## Assumptions

- Field-level bounding boxes should be visible on every document by default.
- All OCR text block boxes are out of scope unless later added as a toolbar toggle.
- Annotation tools are visual placeholders only.
- Confirming a document saves edits and advances; it does not add approval-status persistence yet.
- Existing medical-document extraction fields remain the source of truth.
- No database migration is needed unless persisted approval status or reviewer metadata is added later.

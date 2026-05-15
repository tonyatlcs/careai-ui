# View Document Page Decomposition Plan

## Summary

Refactor `ViewDocumentPage.tsx` into a thin route/container component plus focused sub-components and local utilities. Preserve the current user experience, routes, API calls, styling, PDF rendering, OCR fallback behavior, and field evidence box alignment.

## Goals

- Make `ViewDocumentPage.tsx` easier to scan and maintain.
- Separate API/state orchestration from rendering concerns.
- Isolate PDF, image, OCR fallback, transcript, rail, toolbar, and extracted-field UI into named components.
- Keep the first pass mechanical and behavior-preserving.

## Proposed Component Split

Create document-review-specific components under:

`careai-ui/src/features/documents/pages/ViewDocumentPage/components/`

Recommended components:

- `DocumentReviewHeader`: document name, Cancel, Save, and Confirm & Next actions.
- `PageRail`: page thumbnail list, active page styling, and selected-page changes.
- `DocumentToolbar`: page indicator, disabled annotation controls, and zoom controls.
- `DocumentPreview`: central preview status branching and preview mode selection.
- `PdfPreview`: PDF canvas rendering plus evidence overlays.
- `ImagePreview`: JPG/PNG preview sizing plus evidence overlays.
- `OcrFallbackPreview`: OCR-only page box layout plus transcript.
- `FieldBoxLayer`: evidence box rendering, selected state, warning state, hover handling, and scroll anchor ref.
- `TranscriptPanel`: OCR transcript grouped by page with page selection on block click.
- `ExtractionPanel`: extracted field form, confidence badges, category select, text inputs, and focus handling.

## Utility Extraction

Move page-local pure helpers into:

`careai-ui/src/features/documents/pages/ViewDocumentPage/viewDocumentPageUtils.ts`

Include:

- `confidenceLabelForField`
- `isWarnConfidence`
- `pagesFromContent`
- `inferPageSpace`
- `boxesOnPage`
- `firstBoxPageForField`
- `previewInnerSize`

Keep shared constants close to those helpers unless a component owns them more clearly:

- `PDF_SCREENSHOT_OCR_SCALE`
- `CONFIDENCE_WARN`
- `FIELD_LABELS`
- `CATEGORY_OPTIONS`
- `PREVIEW_PAD`

## Container Responsibilities

Keep `ViewDocumentPage.tsx` responsible for orchestration:

- Read `documentId` from route params.
- Fetch content and original file blob.
- Patch extraction data.
- Read queued document ids from Redux.
- Manage save, dirty-state baseline, and Confirm & Next navigation.
- Own selected page, focused field, hovered field, zoom, natural image size, PDF document state, PDF page dimensions, and preview container measurement.
- Pass typed props into extracted components.

Avoid adding React context in the first pass. Explicit props are preferable while the boundaries are still straightforward.

## Behavior To Preserve

- Missing document id, loading, error, pending, processing, failed, and unavailable preview messages.
- PDF original rendering when available.
- JPG/PNG original rendering when available.
- DOCX and file-error OCR fallback.
- PDF OCR overlay alignment using `PDF_SCREENSHOT_OCR_SCALE`.
- Page rail behavior, including PDF thumbnail cap from `usePdfRailThumbnails`.
- Field focus jumping to the first evidence box page.
- Selected evidence box scroll-into-view behavior.
- Hovering evidence boxes highlights the matching extracted field.
- Transcript block click changes the selected page.
- Save button enabled only when the form is dirty and available.
- Confirm & Next saves dirty data before moving to the next document.
- Existing CSS module class names and visual output.

## Implementation Order

1. Extract pure helpers and constants into `viewDocumentPageUtils.ts`.
2. Extract passive rendering components first: `DocumentReviewHeader`, `DocumentToolbar`, `TranscriptPanel`, and `FieldBoxLayer`.
3. Extract `ExtractionPanel`, keeping form updates and focus behavior controlled by props.
4. Extract `PageRail`, including thumbnail rendering decisions.
5. Extract preview components, starting with `OcrFallbackPreview`, then `ImagePreview`, then `PdfPreview`.
6. Replace the remaining inline render functions in `ViewDocumentPage.tsx` with component usage.
7. Remove now-unused imports and verify TypeScript types.

## Test Plan

Run from `careai-ui`:

```bash
npm run build
npm run lint
```

Manual verification scenarios:

- Open a completed PDF document and confirm canvas rendering, page switching, zoom, thumbnails, and evidence box alignment.
- Open a completed JPG or PNG document and confirm image sizing and evidence box alignment.
- Open a DOCX document or simulate file preview failure and confirm OCR fallback plus transcript.
- Check pending, processing, failed, loading, and missing/error states.
- Edit extracted fields, save, and confirm dirty-state behavior.
- Use Confirm & Next and confirm it saves dirty edits before navigating.
- Focus each extracted field and confirm the selected page follows the first evidence box.

## Assumptions

- This is a behavior-preserving refactor only.
- No new UI copy, API behavior, route behavior, or styling changes are intended.
- Components remain local to `ViewDocumentPage` because they are specific to document review.
- No new test framework is introduced for this refactor.

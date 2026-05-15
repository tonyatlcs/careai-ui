import type { PDFDocumentProxy } from "pdfjs-dist";
import type { FC, RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import {
  EXTRACTION_FIELD_KEYS,
  type ExtractionFieldKey,
  type GetDocumentContentResponse,
} from "@/features/documents/documentContentTypes";
import { FieldBoxLayer } from "@/features/documents/pages/ViewDocumentPage/components/FieldBoxLayer/FieldBoxLayer";
import {
  PDF_SCREENSHOT_OCR_SCALE,
  inferPageSpace,
  previewInnerSize,
} from "@/features/documents/pages/ViewDocumentPage/utils/viewDocumentPageUtils";
import layoutStyles from "../DocumentPreviewLayout/DocumentPreviewLayout.module.scss";

export type PdfPreviewProps = {
  content: GetDocumentContentResponse;
  pdfDoc: PDFDocumentProxy | null;
  selectedPage: number;
  originalReady: boolean;
  previewAvail: { width: number; height: number };
  zoom: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  boxAnchorRef: RefObject<HTMLDivElement | null>;
  focusedField: ExtractionFieldKey | null;
  onHoverField: (field: ExtractionFieldKey | null) => void;
  pdfPagePts: { page: number; w: number; h: number } | null;
};

export const PdfPreview: FC<PdfPreviewProps> = ({
  content,
  pdfDoc,
  selectedPage,
  originalReady,
  previewAvail,
  zoom,
  viewportRef,
  boxAnchorRef,
  focusedField,
  onHoverField,
  pdfPagePts,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      !pdfDoc ||
      content.documentKind !== "pdf" ||
      !originalReady
    ) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const page = await pdfDoc.getPage(selectedPage);
      const hasPageGeometry =
        content.content.blocks.some((b) => b.page === selectedPage) ||
        EXTRACTION_FIELD_KEYS.some((k) =>
          content.fieldBoxes[k].some((bx) => bx.page === selectedPage),
        );
      /**
       * OCR bboxes use the full screenshot raster (see `PDF_SCREENSHOT_OCR_SCALE`). Match that
       * viewport here and in `FieldBoxLayer` — do not normalize with `inferPageSpace`, which
       * uses only the extent of detected lines and misaligns overlays vs the rendered page.
       */
      const alignScale =
        content.boxesAvailable && hasPageGeometry
          ? PDF_SCREENSHOT_OCR_SCALE
          : 1;
      const aligned = page.getViewport({ scale: alignScale });
      const { w: aw, h: ah } = previewInnerSize(
        previewAvail.width,
        previewAvail.height,
      );
      const fit = Math.min(1, aw / aligned.width, ah / aligned.height);
      const viewport = page.getViewport({ scale: alignScale * fit });
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      if (cancelled) {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, selectedPage, content, originalReady, previewAvail]);

  const pdfRasterSpace =
    pdfPagePts && pdfPagePts.page === selectedPage && content.boxesAvailable
      ? {
          width: pdfPagePts.w * PDF_SCREENSHOT_OCR_SCALE,
          height: pdfPagePts.h * PDF_SCREENSHOT_OCR_SCALE,
        }
      : null;
  const space =
    pdfRasterSpace ??
    inferPageSpace(selectedPage, content.content.blocks, content.fieldBoxes);

  return (
    <div className={layoutStyles.previewStack}>
      <div
        className={layoutStyles.zoomWrap}
        style={{ transform: `scale(${zoom})` }}
      >
        <div className={layoutStyles.viewport} ref={viewportRef}>
          <canvas ref={canvasRef} className={layoutStyles.canvas} />
          <div className={layoutStyles.boxLayer}>
            <FieldBoxLayer
              boxAnchorRef={boxAnchorRef}
              fieldBoxes={content.fieldBoxes}
              focusedField={focusedField}
              page={selectedPage}
              space={space}
              onHoverField={onHoverField}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

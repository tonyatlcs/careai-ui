import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";

const THUMB_SCALE = 0.22;
const JPEG_QUALITY = 0.82;

/** Cap rail thumbnail generation for very large PDFs. */
export const MAX_PDF_RAIL_THUMBNAIL_PAGES = 80;

/**
 * Renders each PDF page to a small JPEG data URL for the left-rail thumbnails.
 */
export function usePdfRailThumbnails(pdfDoc: PDFDocumentProxy | null): Record<number, string> {
  const [thumbnailState, setThumbnailState] = useState<{
    pdfDoc: PDFDocumentProxy | null;
    urlsByPage: Record<number, string>;
  }>({ pdfDoc: null, urlsByPage: {} });

  useEffect(() => {
    if (!pdfDoc) {
      return;
    }

    let cancelled = false;
    const pageCount = Math.min(pdfDoc.numPages, MAX_PDF_RAIL_THUMBNAIL_PAGES);

    (async () => {
      for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
        if (cancelled) {
          return;
        }
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: THUMB_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          continue;
        }
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) {
          return;
        }
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        if (!cancelled) {
          setThumbnailState((prev) => ({
            pdfDoc,
            urlsByPage: {
              ...(prev.pdfDoc === pdfDoc ? prev.urlsByPage : {}),
              [pageNum]: dataUrl,
            },
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc]);

  return thumbnailState.pdfDoc === pdfDoc ? thumbnailState.urlsByPage : {};
}

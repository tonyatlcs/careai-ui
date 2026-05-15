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
  const [urlsByPage, setUrlsByPage] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!pdfDoc) {
      setUrlsByPage({});
      return;
    }

    let cancelled = false;
    const pageCount = Math.min(pdfDoc.numPages, MAX_PDF_RAIL_THUMBNAIL_PAGES);

    (async () => {
      const next: Record<number, string> = {};
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
        next[pageNum] = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      }
      if (!cancelled) {
        setUrlsByPage(next);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc]);

  return urlsByPage;
}

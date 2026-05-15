import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useLayoutEffect, useState } from "react";
import type { DocumentKind } from "@/features/documents/documentContentTypes";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function usePdfDocument({
  documentId,
  documentKind,
  fileObjectUrl,
  originalReady,
  selectedPage,
}: {
  documentId: string;
  documentKind: DocumentKind | undefined;
  fileObjectUrl: string | null;
  originalReady: boolean;
  selectedPage: number;
}) {
  const pdfKey =
    fileObjectUrl && originalReady && documentKind === "pdf"
      ? `${documentId}:${fileObjectUrl}`
      : "";
  const [pdfState, setPdfState] = useState<{
    doc: PDFDocumentProxy | null;
    key: string;
    numPages: number;
  }>({ doc: null, key: "", numPages: 0 });
  const [pagePtsState, setPagePtsState] = useState<{
    h: number;
    key: string;
    page: number;
    w: number;
  } | null>(null);
  const pdfDoc = pdfState.key === pdfKey ? pdfState.doc : null;
  const pdfNumPages = pdfState.key === pdfKey ? pdfState.numPages : 0;
  const pagePtsKey = `${pdfKey}:${selectedPage}`;
  const pdfPagePts =
    pagePtsState?.key === pagePtsKey
      ? {
          page: pagePtsState.page,
          w: pagePtsState.w,
          h: pagePtsState.h,
        }
      : null;

  useEffect(() => {
    if (!pdfKey || !fileObjectUrl) {
      return;
    }
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;
    void (async () => {
      try {
        const loadingTask = pdfjs.getDocument({ url: fileObjectUrl });
        doc = await loadingTask.promise;
        if (cancelled) {
          await doc.destroy();
          return;
        }
        setPdfState({ doc, key: pdfKey, numPages: doc.numPages });
      } catch {
        if (!cancelled) {
          setPdfState({ doc: null, key: pdfKey, numPages: 0 });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (doc) {
        void doc.destroy();
      }
    };
  }, [fileObjectUrl, pdfKey]);

  useLayoutEffect(() => {
    if (!pdfDoc || !pdfKey) {
      return;
    }
    let cancelled = false;
    void pdfDoc.getPage(selectedPage).then((p) => {
      if (cancelled) {
        return;
      }
      const v = p.getViewport({ scale: 1 });
      setPagePtsState({
        h: v.height,
        key: pagePtsKey,
        page: selectedPage,
        w: v.width,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pdfKey, pagePtsKey, selectedPage]);

  return {
    pdfDoc,
    pdfNumPages,
    pdfPagePts,
  };
}

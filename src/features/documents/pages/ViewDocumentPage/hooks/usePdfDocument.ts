import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useLayoutEffect, useState } from "react";
import type { DocumentKind } from "@/features/documents/documentContentTypes";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function usePdfDocument({
  fileBlob,
  documentId,
  documentKind,
  originalReady,
  selectedPage,
}: {
  fileBlob: Blob | undefined;
  documentId: string;
  documentKind: DocumentKind | undefined;
  originalReady: boolean;
  selectedPage: number;
}) {
  const canLoadPdf = Boolean(fileBlob && originalReady && documentKind === "pdf");
  const [pdfState, setPdfState] = useState<{
    blob: Blob | undefined;
    doc: PDFDocumentProxy | null;
    documentId: string;
    numPages: number;
  }>({ blob: undefined, doc: null, documentId: "", numPages: 0 });
  const [pagePtsState, setPagePtsState] = useState<{
    h: number;
    key: string;
    page: number;
    w: number;
  } | null>(null);
  const pdfDoc =
    canLoadPdf &&
    pdfState.documentId === documentId &&
    pdfState.blob === fileBlob
      ? pdfState.doc
      : null;
  const pdfNumPages =
    canLoadPdf &&
    pdfState.documentId === documentId &&
    pdfState.blob === fileBlob
      ? pdfState.numPages
      : 0;
  const pdfKey = canLoadPdf && fileBlob ? `${documentId}:${pdfState.numPages}` : "";
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
    if (!canLoadPdf || !fileBlob) {
      return;
    }
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;
    let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;
    void (async () => {
      try {
        const bytes = new Uint8Array(await fileBlob.arrayBuffer());
        if (cancelled) {
          return;
        }
        loadingTask = pdfjs.getDocument({ data: bytes });
        doc = await loadingTask.promise;
        if (cancelled) {
          await doc.destroy();
          return;
        }
        setPdfState({ blob: fileBlob, doc, documentId, numPages: doc.numPages });
      } catch {
        if (!cancelled) {
          setPdfState({ blob: fileBlob, doc: null, documentId, numPages: 0 });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (loadingTask && !doc) {
        void loadingTask.destroy();
      }
      if (doc) {
        void doc.destroy();
      }
    };
  }, [canLoadPdf, documentId, fileBlob]);

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

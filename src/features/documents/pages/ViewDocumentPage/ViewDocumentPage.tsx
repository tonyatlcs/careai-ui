import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { ExtractionFieldKey, ExtractionFields } from "@/features/documents/documentContentTypes";
import {
  documentsApi,
  useGetDocumentContentQuery,
  useGetDocumentFileBlobQuery,
  usePatchDocumentExtractionMutation,
} from "@/features/documents/documentsApi";
import { DocumentPreview } from "@/features/documents/pages/ViewDocumentPage/components/DocumentPreview/DocumentPreview";
import documentPreviewStyles from "@/features/documents/pages/ViewDocumentPage/components/DocumentPreview/DocumentPreview.module.scss";
import { DocumentReviewHeader } from "@/features/documents/pages/ViewDocumentPage/components/DocumentReviewHeader/DocumentReviewHeader";
import { DocumentToolbar } from "@/features/documents/pages/ViewDocumentPage/components/DocumentToolbar/DocumentToolbar";
import { ExtractionPanel } from "@/features/documents/pages/ViewDocumentPage/components/ExtractionPanel/ExtractionPanel";
import extractionPanelStyles from "@/features/documents/pages/ViewDocumentPage/components/ExtractionPanel/ExtractionPanel.module.scss";
import { PageRail } from "@/features/documents/pages/ViewDocumentPage/components/PageRail/PageRail";
import styles from "@/features/documents/pages/ViewDocumentPage/ViewDocumentPage.module.scss";
import { usePdfRailThumbnails } from "@/features/documents/pages/ViewDocumentPage/usePdfRailThumbnails";
import { firstBoxPageForField, pagesFromContent } from "@/features/documents/pages/ViewDocumentPage/viewDocumentPageUtils";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const ViewDocumentPage: React.FC = () => {
  const { documentId = "" } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  /**
   * List view polls `/documents` while rows are processing; this query does not, so a prefetched
   * or older `/content` payload can stay on `processing` after the queue already shows completed.
   * Drive polling from cached slice data (not `content` from the same hook) to avoid a circular
   * initializer. Refetch on mount so opening a document always reconciles with the server.
   */
  const contentCached = useSelector((state: RootState) =>
    documentId
      ? documentsApi.endpoints.getDocumentContent.select(documentId)(state)?.data
      : undefined,
  );
  const contentPollMs =
    contentCached?.status === "pending" || contentCached?.status === "processing"
      ? 1200
      : 0;

  const {
    data: content,
    isLoading: contentLoading,
    isError: contentError,
  } = useGetDocumentContentQuery(documentId, {
    skip: !documentId,
    refetchOnMountOrArgChange: true,
    skipPollingIfUnfocused: true,
    pollingInterval: contentPollMs,
  });

  const skipFile =
    !documentId ||
    !content ||
    content.documentKind === "docx" ||
    content.status === "pending" ||
    content.status === "processing";

  const {
    data: fileBlob,
    isError: fileError,
    isFetching: fileFetching,
  } = useGetDocumentFileBlobQuery(documentId, { skip: skipFile });

  const [patchExtraction, { isLoading: patchLoading }] =
    usePatchDocumentExtractionMutation();

  const [form, setForm] = useState<ExtractionFields | null>(null);
  const [baseline, setBaseline] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);
  const [focusedField, setFocusedField] = useState<ExtractionFieldKey | null>(null);
  const [hoveredField, setHoveredField] = useState<ExtractionFieldKey | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  /** PDF user-space page size (scale 1 viewport) for the active thumbnail page. */
  const [pdfPagePts, setPdfPagePts] = useState<{
    page: number;
    w: number;
    h: number;
  } | null>(null);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const pdfThumbUrls = usePdfRailThumbnails(pdfDoc);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [previewAvail, setPreviewAvail] = useState({ width: 720, height: 520 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const boxAnchorRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const dirtyComputed = useMemo(() => {
    if (!form) {
      return false;
    }
    return JSON.stringify(form) !== baseline;
  }, [form, baseline]);

  useEffect(() => {
    if (!content) {
      return;
    }
    if (!content.extraction) {
      setForm(null);
      setBaseline("");
      return;
    }
    const next: ExtractionFields = { ...content.extraction };
    setForm(next);
    setBaseline(JSON.stringify(next));
  }, [content?.documentId, content?.extraction]);

  const fileObjectUrl = useMemo(() => {
    if (!fileBlob) {
      return null;
    }
    const url = URL.createObjectURL(fileBlob);
    return url;
  }, [fileBlob]);

  useEffect(() => {
    objectUrlRef.current = fileObjectUrl;
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [fileObjectUrl]);

  useEffect(() => {
    setFocusedField(null);
    setHoveredField(null);
    setZoom(1);
  }, [documentId]);

  const ocrOnly =
    content != null &&
    (content.documentKind === "docx" || fileError === true);

  const originalReady =
    content != null &&
    content.documentKind !== "docx" &&
    fileBlob != null &&
    !fileError;

  const pages = useMemo(() => {
    if (!content) {
      return [1];
    }
    if (originalReady && pdfNumPages > 0) {
      return Array.from({ length: pdfNumPages }, (_, i) => i + 1);
    }
    if (originalReady && (content.documentKind === "jpg" || content.documentKind === "png")) {
      return [1];
    }
    return pagesFromContent(content);
  }, [content, originalReady, pdfNumPages]);

  useEffect(() => {
    if (!pages.includes(selectedPage)) {
      setSelectedPage(pages[0] ?? 1);
    }
  }, [pages, selectedPage]);

  useEffect(() => {
    if (!fileObjectUrl || !originalReady || content?.documentKind !== "pdf") {
      setPdfDoc(null);
      setPdfNumPages(0);
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
        setPdfDoc(doc);
        setPdfNumPages(doc.numPages);
      } catch {
        if (!cancelled) {
          setPdfDoc(null);
          setPdfNumPages(0);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (doc) {
        void doc.destroy();
      }
    };
  }, [fileObjectUrl, originalReady, content?.documentKind, documentId]);

  useLayoutEffect(() => {
    if (!pdfDoc || content?.documentKind !== "pdf") {
      setPdfPagePts(null);
      return;
    }
    let cancelled = false;
    void pdfDoc.getPage(selectedPage).then((p) => {
      if (cancelled) {
        return;
      }
      const v = p.getViewport({ scale: 1 });
      setPdfPagePts({ page: selectedPage, w: v.width, h: v.height });
    });
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, selectedPage, content?.documentKind]);

  useLayoutEffect(() => {
    const el = previewWrapRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      const { clientWidth, clientHeight } = el;
      if (clientWidth > 0 && clientHeight > 0) {
        setPreviewAvail({ width: clientWidth, height: clientHeight });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!focusedField || !content) {
      return;
    }
    const p = firstBoxPageForField(content.fieldBoxes, focusedField);
    if (p != null && p !== selectedPage) {
      setSelectedPage(p);
    }
  }, [focusedField, content]);

  useLayoutEffect(() => {
    if (!focusedField) {
      return;
    }
    const anchor = boxAnchorRef.current;
    if (anchor) {
      anchor.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }
  }, [focusedField, selectedPage, content]);

  const updateField = useCallback((key: ExtractionFieldKey, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const persist = useCallback(async () => {
    if (!documentId || !form) {
      return;
    }
    const saved = await patchExtraction({
      documentId,
      body: form,
    }).unwrap();
    const next: ExtractionFields = {
      name: saved.name,
      reportDate: saved.reportDate,
      subject: saved.subject,
      contactSource: saved.contactSource,
      issueUser: saved.issueUser,
      category: saved.category,
    };
    setForm(next);
    setBaseline(JSON.stringify(next));
  }, [documentId, form, patchExtraction]);

  const handleSave = async () => {
    await persist();
  };

  const handleFieldFocus = (field: ExtractionFieldKey) => {
    setFocusedField(field);
    if (content) {
      const p = firstBoxPageForField(content.fieldBoxes, field);
      if (p != null) {
        setSelectedPage(p);
      }
    }
  };

  if (!documentId) {
    return <p className={documentPreviewStyles.feedback}>Missing document id.</p>;
  }

  return (
    <div className={styles.page}>
      <DocumentReviewHeader
        documentName={content?.documentName}
        patchLoading={patchLoading}
        saveDisabled={!dirtyComputed || !form || patchLoading}
        onCancel={() => navigate("/documents")}
        onSave={handleSave}
      />

      <div className={styles.body}>
        <PageRail
          content={content}
          fileObjectUrl={fileObjectUrl}
          layoutClassName={styles.railSlot}
          originalReady={originalReady}
          pages={pages}
          pdfDoc={pdfDoc}
          pdfThumbUrls={pdfThumbUrls}
          selectedPage={selectedPage}
          onSelectPage={setSelectedPage}
        />

        <section className={styles.center}>
          <DocumentToolbar
            pageCount={pages.length}
            selectedPage={selectedPage}
            onZoomIn={() =>
              setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10))
            }
            onZoomOut={() =>
              setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))
            }
          />
          <div ref={previewWrapRef} className={styles.previewWrap}>
            <DocumentPreview
              boxAnchorRef={boxAnchorRef}
              content={content}
              contentError={contentError}
              contentLoading={contentLoading}
              fileFetching={fileFetching}
              fileObjectUrl={fileObjectUrl}
              focusedField={focusedField}
              ocrOnly={ocrOnly}
              originalReady={originalReady}
              pdfDoc={pdfDoc}
              pdfPagePts={pdfPagePts}
              previewAvail={previewAvail}
              selectedPage={selectedPage}
              viewportRef={viewportRef}
              zoom={zoom}
              onHoverField={setHoveredField}
              onSelectPage={setSelectedPage}
            />
          </div>
        </section>

        <aside className={styles.side}>
          <div className={styles.sideHeader}>
            <h2 className={styles.sideTitle}>Extracted Data</h2>
          </div>
          <div className={styles.sideBody}>
            {!content ? null : !form ? (
              <p className={extractionPanelStyles.fieldMeta}>
                Extracted fields are not available yet. Process the document first.
              </p>
            ) : (
              <ExtractionPanel
                content={content}
                focusedField={focusedField}
                form={form}
                hoveredField={hoveredField}
                onFieldFocus={handleFieldFocus}
                onUpdateField={updateField}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

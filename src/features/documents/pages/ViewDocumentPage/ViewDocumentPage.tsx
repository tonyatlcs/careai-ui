import React, { useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type {
  ExtractionFieldKey,
  ExtractionFields,
} from "@/features/documents/documentContentTypes";
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
import { useDocumentScopedState } from "@/features/documents/pages/ViewDocumentPage/hooks/useDocumentScopedState";
import { useExtractionForm } from "@/features/documents/pages/ViewDocumentPage/hooks/useExtractionForm";
import { useFocusedFieldNavigation } from "@/features/documents/pages/ViewDocumentPage/hooks/useFocusedFieldNavigation";
import { useObjectUrl } from "@/features/documents/pages/ViewDocumentPage/hooks/useObjectUrl";
import { usePdfDocument } from "@/features/documents/pages/ViewDocumentPage/hooks/usePdfDocument";
import { usePdfRailThumbnails } from "@/features/documents/pages/ViewDocumentPage/hooks/usePdfRailThumbnails";
import { usePreviewSize } from "@/features/documents/pages/ViewDocumentPage/hooks/usePreviewSize";
import {
  firstBoxPageForField,
  pagesFromContent,
} from "@/features/documents/pages/ViewDocumentPage/utils/viewDocumentPageUtils";

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
      ? documentsApi.endpoints.getDocumentContent.select(documentId)(state)
          ?.data
      : undefined,
  );
  const contentPollMs =
    contentCached?.status === "pending" ||
    contentCached?.status === "processing"
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

  const { dirty, form, setSavedForm, updateField } = useExtractionForm(content);
  const [selectedPageState, setSelectedPage] = useDocumentScopedState(
    documentId,
    1,
  );
  const [focusedField, setFocusedField] =
    useDocumentScopedState<ExtractionFieldKey | null>(documentId, null);
  const [hoveredField, setHoveredField] =
    useDocumentScopedState<ExtractionFieldKey | null>(documentId, null);
  const [zoom, setZoom] = useDocumentScopedState(documentId, 1);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const boxAnchorRef = useRef<HTMLDivElement>(null);
  const fileObjectUrl = useObjectUrl(fileBlob);
  const previewAvail = usePreviewSize(previewWrapRef);

  const ocrOnly =
    content != null && (content.documentKind === "docx" || fileError === true);

  const originalReady =
    content != null &&
    content.documentKind !== "docx" &&
    fileBlob != null &&
    !fileError;
  const selectedPageCandidate = Math.max(1, selectedPageState);

  const { pdfDoc, pdfNumPages, pdfPagePts } = usePdfDocument({
    documentId,
    documentKind: content?.documentKind,
    fileObjectUrl,
    originalReady,
    selectedPage: selectedPageCandidate,
  });
  const pdfThumbUrls = usePdfRailThumbnails(pdfDoc);

  const pages = useMemo(() => {
    if (!content) {
      return [1];
    }
    if (originalReady && pdfNumPages > 0) {
      return Array.from({ length: pdfNumPages }, (_, i) => i + 1);
    }
    if (
      originalReady &&
      (content.documentKind === "jpg" || content.documentKind === "png")
    ) {
      return [1];
    }
    return pagesFromContent(content);
  }, [content, originalReady, pdfNumPages]);

  const selectedPage = pages.includes(selectedPageState)
    ? selectedPageState
    : (pages[0] ?? 1);

  useFocusedFieldNavigation({
    boxAnchorRef,
    content,
    focusedField,
    selectedPage,
    setSelectedPage,
  });

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
    setSavedForm(next);
  }, [documentId, form, patchExtraction, setSavedForm]);

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
    return (
      <p className={documentPreviewStyles.feedback}>Missing document id.</p>
    );
  }

  return (
    <div className={styles.page}>
      <DocumentReviewHeader
        documentName={content?.documentName}
        patchLoading={patchLoading}
        saveDisabled={!dirty || !form || patchLoading}
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
                Extracted fields are not available yet. Process the document
                first.
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

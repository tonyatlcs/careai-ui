import type { FC, ReactNode, RefObject } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { ExtractionFieldKey, GetDocumentContentResponse } from "@/features/documents/documentContentTypes";
import { ImagePreview } from "@/features/documents/pages/ViewDocumentPage/components/ImagePreview/ImagePreview";
import { OcrFallbackPreview } from "@/features/documents/pages/ViewDocumentPage/components/OcrFallbackPreview/OcrFallbackPreview";
import { PdfPreview } from "@/features/documents/pages/ViewDocumentPage/components/PdfPreview/PdfPreview";
import styles from "./DocumentPreview.module.scss";

export type DocumentPreviewProps = {
  contentLoading: boolean;
  contentError: boolean;
  content: GetDocumentContentResponse | undefined;
  ocrOnly: boolean;
  originalReady: boolean;
  fileFetching: boolean;
  fileObjectUrl: string | null;
  pdfDoc: PDFDocumentProxy | null;
  pdfPagePts: { page: number; w: number; h: number } | null;
  selectedPage: number;
  onSelectPage: (page: number) => void;
  previewAvail: { width: number; height: number };
  zoom: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  boxAnchorRef: RefObject<HTMLDivElement | null>;
  focusedField: ExtractionFieldKey | null;
  onHoverField: (field: ExtractionFieldKey | null) => void;
};

export const DocumentPreview: FC<DocumentPreviewProps> = ({
  contentLoading,
  contentError,
  content,
  ocrOnly,
  originalReady,
  fileFetching,
  fileObjectUrl,
  pdfDoc,
  pdfPagePts,
  selectedPage,
  onSelectPage,
  previewAvail,
  zoom,
  viewportRef,
  boxAnchorRef,
  focusedField,
  onHoverField,
}) => {
  if (contentLoading) {
    return <p className={styles.feedback}>Loading document…</p>;
  }
  if (contentError || !content) {
    return <p className={styles.feedback}>Could not load this document.</p>;
  }

  if (content.status === "pending") {
    return <p className={styles.feedback}>This document is pending processing.</p>;
  }
  if (content.status === "processing") {
    return <p className={styles.feedback}>This document is still processing.</p>;
  }

  if (content.status !== "completed" && content.status !== "failed") {
    return <p className={styles.feedback}>This document is not ready to review.</p>;
  }

  const failedBanner: ReactNode =
    content.status === "failed" ? (
      <p className={styles.feedback} style={{ paddingBottom: 0 }}>
        Processing failed; OCR fallback is shown when available.
      </p>
    ) : null;

  if (ocrOnly || !originalReady) {
    if (!ocrOnly && fileFetching) {
      return (
        <>
          {failedBanner}
          <p className={styles.feedback}>Loading original file preview…</p>
        </>
      );
    }
    return (
      <>
        {failedBanner}
        <OcrFallbackPreview
          boxAnchorRef={boxAnchorRef}
          content={content}
          focusedField={focusedField}
          previewAvail={previewAvail}
          selectedPage={selectedPage}
          viewportRef={viewportRef}
          zoom={zoom}
          onHoverField={onHoverField}
          onSelectPage={onSelectPage}
        />
      </>
    );
  }

  if (content.documentKind === "pdf" && fileObjectUrl) {
    return (
      <>
        {failedBanner}
        <PdfPreview
          boxAnchorRef={boxAnchorRef}
          content={content}
          focusedField={focusedField}
          originalReady={originalReady}
          pdfDoc={pdfDoc}
          pdfPagePts={pdfPagePts}
          previewAvail={previewAvail}
          selectedPage={selectedPage}
          viewportRef={viewportRef}
          zoom={zoom}
          onHoverField={onHoverField}
        />
      </>
    );
  }

  if ((content.documentKind === "jpg" || content.documentKind === "png") && fileObjectUrl) {
    return (
      <>
        {failedBanner}
        <ImagePreview
          key={content.documentId}
          boxAnchorRef={boxAnchorRef}
          content={content}
          fileObjectUrl={fileObjectUrl}
          focusedField={focusedField}
          previewAvail={previewAvail}
          viewportRef={viewportRef}
          zoom={zoom}
          onHoverField={onHoverField}
        />
      </>
    );
  }

  return (
    <>
      {failedBanner}
      <p className={styles.feedback}>Preview is not available.</p>
    </>
  );
};

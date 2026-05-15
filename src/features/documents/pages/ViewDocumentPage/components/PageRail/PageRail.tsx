import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { GetDocumentContentResponse } from "@/features/documents/documentContentTypes";
import {
  MAX_PDF_RAIL_THUMBNAIL_PAGES,
} from "@/features/documents/pages/ViewDocumentPage/usePdfRailThumbnails";
import { inferPageSpace } from "@/features/documents/pages/ViewDocumentPage/viewDocumentPageUtils";
import styles from "./PageRail.module.scss";

export type PageRailProps = {
  pages: number[];
  selectedPage: number;
  onSelectPage: (page: number) => void;
  content: GetDocumentContentResponse | undefined;
  originalReady: boolean;
  pdfDoc: PDFDocumentProxy | null;
  fileObjectUrl: string | null;
  pdfThumbUrls: Record<number, string>;
  /** Responsive rail overrides from the page shell (e.g. `ViewDocumentPage` `.railSlot`). */
  layoutClassName?: string;
};

function RailPageThumbnail({
  pageNum,
  content,
  originalReady,
  pdfDoc,
  fileObjectUrl,
  pdfThumbUrls,
}: {
  pageNum: number;
  content: GetDocumentContentResponse | undefined;
  originalReady: boolean;
  pdfDoc: PDFDocumentProxy | null;
  fileObjectUrl: string | null;
  pdfThumbUrls: Record<number, string>;
}) {
  if (!content) {
    return (
      <>
        <div aria-hidden className={styles.thumbSkeleton} />
        <span className={styles.thumbLabel}>{pageNum}</span>
      </>
    );
  }

  const pdfMode =
    content.documentKind === "pdf" && originalReady && pdfDoc != null && fileObjectUrl != null;
  const imageMode =
    (content.documentKind === "jpg" || content.documentKind === "png") &&
    originalReady &&
    fileObjectUrl != null;

  if (pdfMode) {
    if (pageNum > MAX_PDF_RAIL_THUMBNAIL_PAGES) {
      return (
        <>
          <div className={styles.thumbOverflow} title={`Page ${pageNum}`}>
            …
          </div>
          <span className={styles.thumbLabel}>{pageNum}</span>
        </>
      );
    }
    const src = pdfThumbUrls[pageNum];
    return (
      <>
        {src ? (
          <img alt="" className={styles.thumbImage} src={src} />
        ) : (
          <div aria-hidden className={styles.thumbSkeleton} />
        )}
        <span className={styles.thumbLabel}>{pageNum}</span>
      </>
    );
  }

  if (imageMode && pageNum === 1) {
    return (
      <>
        <img alt="" className={styles.thumbImage} src={fileObjectUrl} />
        <span className={styles.thumbLabel}>1</span>
      </>
    );
  }

  const sp = inferPageSpace(pageNum, content.content.blocks, content.fieldBoxes);
  const ar = `${Math.max(sp.width, 1)} / ${Math.max(sp.height, 1)}`;
  return (
    <>
      <div className={styles.thumbOcr} style={{ aspectRatio: ar }} />
      <span className={styles.thumbLabel}>{pageNum}</span>
    </>
  );
}

export const PageRail: FC<PageRailProps> = ({
  pages,
  selectedPage,
  onSelectPage,
  content,
  originalReady,
  pdfDoc,
  fileObjectUrl,
  pdfThumbUrls,
  layoutClassName,
}) => (
  <aside className={cn(styles.rail, layoutClassName)}>
    {pages.map((p) => (
      <button
        aria-label={`Go to page ${p}`}
        className={`${styles.thumb} ${p === selectedPage ? styles.thumbActive : ""}`}
        key={p}
        type="button"
        onClick={() => onSelectPage(p)}
      >
        <RailPageThumbnail
          content={content}
          fileObjectUrl={fileObjectUrl}
          originalReady={originalReady}
          pageNum={p}
          pdfDoc={pdfDoc}
          pdfThumbUrls={pdfThumbUrls}
        />
      </button>
    ))}
  </aside>
);

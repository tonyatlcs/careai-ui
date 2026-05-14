import React, { useEffect, useState } from "react";
import { DocumentsTable } from "@/features/documents/Components/DocumentsTable/DocumentsTable";
import { useListDocumentsQuery } from "@/features/documents/documentsApi";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import styles from "@/features/documents/pages/DocumentsPage.module.scss";

const DOCUMENTS_PAGE_SIZE = 20;

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];
  if (totalPages <= 9) return range(1, totalPages);
  if (currentPage <= 5) return [...range(1, 7), "ellipsis", totalPages];
  if (currentPage >= totalPages - 4) {
    return [1, "ellipsis", ...range(totalPages - 6, totalPages)];
  }
  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

type DocumentsPaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function DocumentsPaginationBar({
  page,
  totalPages,
  onPageChange,
}: DocumentsPaginationBarProps) {
  if (totalPages <= 1) {
    return null;
  }

  const effectivePage = Math.min(Math.max(1, page), totalPages);
  const paginationItems = getPaginationItems(effectivePage, totalPages);
  const hasPreviousPage = effectivePage > 1;
  const hasNextPage = effectivePage < totalPages;

  return (
    <footer className={styles.paginationFooter}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={cn(!hasPreviousPage && "pointer-events-none opacity-50")}
              aria-disabled={!hasPreviousPage}
              onClick={(e) => {
                e.preventDefault();
                if (hasPreviousPage) onPageChange(effectivePage - 1);
              }}
            />
          </PaginationItem>
          {paginationItems.map((item, index) => (
            <PaginationItem
              key={typeof item === "number" ? item : `ellipsis-${index}`}
            >
              {item === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  size="icon"
                  isActive={item === effectivePage}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item !== effectivePage) onPageChange(item);
                  }}
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              className={cn(!hasNextPage && "pointer-events-none opacity-50")}
              aria-disabled={!hasNextPage}
              onClick={(e) => {
                e.preventDefault();
                if (hasNextPage) onPageChange(effectivePage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </footer>
  );
}

export const DocumentsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useListDocumentsQuery({
    page,
    limit: DOCUMENTS_PAGE_SIZE,
  });

  useEffect(() => {
    if (
      data?.totalPages != null &&
      data.totalPages > 0 &&
      page > data.totalPages
    ) {
      setPage(data.totalPages);
    }
  }, [data?.totalPages, page]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tablePanel}>
        {isLoading ? (
          <p className={styles.feedback}>Loading documents…</p>
        ) : isError ? (
          <p className={styles.feedback}>Could not load documents.</p>
        ) : (
          <div className={styles.tablePanelBody}>
            <DocumentsTable rows={data?.documents ?? []} />
            <DocumentsPaginationBar
              page={data?.page ?? page}
              totalPages={data?.totalPages ?? 0}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

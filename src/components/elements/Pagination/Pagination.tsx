import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

import styles from "./Pagination.module.scss";

type PaginationItemValue = number | "ellipsis";

export type PaginationProps = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItemValue[] {
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

export function Pagination({
  limit,
  page,
  total,
  totalPages,
  onPageChange,
  itemLabel = "items",
  className,
}: PaginationProps) {
  const effectivePage =
    totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;
  const rangeStart = total > 0 ? (effectivePage - 1) * limit + 1 : 0;
  const rangeEnd = total > 0 ? Math.min(effectivePage * limit, total) : 0;
  const paginationItems = getPaginationItems(effectivePage, totalPages);
  const hasPreviousPage = effectivePage > 1;
  const hasNextPage = effectivePage < totalPages;

  return (
    <footer className={cn(styles.paginationFooter, className)}>
      <p className={styles.paginationSummary}>
        Showing {rangeStart} to {rangeEnd} of {total} {itemLabel}
      </p>
      {totalPages > 1 ? (
        <PaginationRoot className={styles.paginationNav}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className={cn(
                  !hasPreviousPage && "pointer-events-none opacity-50",
                )}
                aria-disabled={!hasPreviousPage}
                onClick={(event) => {
                  event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                onClick={(event) => {
                  event.preventDefault();
                  if (hasNextPage) onPageChange(effectivePage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </PaginationRoot>
      ) : null}
    </footer>
  );
}

import { useEffect, useRef } from "react";
import { EllipsisIcon, EyeIcon } from "lucide-react";
import { FileTypeIcon } from "@/features/dashboard/components/FileTypeIcon/FileTypeIcon";
import { fileKindForName } from "@/features/dashboard/components/UploadFileModal/utils/FileModal.util";
import type { DocumentListItem } from "@/features/documents/documentsApi";
import styles from "@/features/documents/Components/DocumentsTable/DocumentsTable.module.scss";
import { Pill, type PillVariant } from "@/components/elements/Pill/Pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryDisplayLabels } from "@/features/documents/Components/DocumentsTable/DocumentTypes";

type DocumentsTableProps = {
  rows: DocumentListItem[];
  selectedRowKeys?: string[];
  isSelectionDisabled?: boolean;
  onSelectedRowKeysChange?: (selectedRowKeys: string[]) => void;
  onViewDocument?: (documentId: string) => void;
  /** Warm RTK cache for the review page (e.g. hover document name). */
  onPrefetchDocument?: (documentId: string) => void;
};

type HeaderSelectionCheckboxProps = {
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function HeaderSelectionCheckbox({
  checked,
  disabled,
  indeterminate,
  onCheckedChange,
}: HeaderSelectionCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checkboxRef.current) return;

    checkboxRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={checked ? "Deselect all rows" : "Select all rows"}
      checked={checked}
      className={styles.selectAllCheckbox}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      type="checkbox"
    />
  );
}

function formatDocumentTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );
  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (dayDiff === 0) {
    return `Today, ${timeLabel}`;
  }

  if (dayDiff === 1) {
    return `Yesterday, ${timeLabel}`;
  }

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);

  return `${dateLabel}, ${timeLabel}`;
}

function getConfidencePillVariant(row: DocumentListItem): PillVariant {
  const value =
    row.confidence != null && Number.isFinite(row.confidence)
      ? row.confidence
      : row.status === "processing"
        ? row.progress
        : null;

  if (value == null) {
    return "warning";
  }

  if (value < 20) {
    return "down";
  }

  if (value > 50) {
    return "up";
  }

  return "warning";
}

function formatConfidenceColumn(row: DocumentListItem): string {
  if (row.confidence != null && Number.isFinite(row.confidence)) {
    return `${row.confidence}%`;
  }

  if (row.status === "processing") {
    const p = Math.min(100, Math.max(0, Math.round(row.progress)));
    return `${p}%`;
  }

  return "Unknown";
}

function getStatusPillVariant(status: DocumentListItem["status"]): PillVariant {
  switch (status) {
    case "completed":
      return "up";
    case "processing":
      return "warning";
    case "pending":
      return "neutral";
    case "failed":
      return "down";
    default:
      return "neutral";
  }
}

function formatStatusForDisplay(status: DocumentListItem["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function formatCategoryForDisplay(category?: string | null): string {
  if (!category) {
    return "Unknown";
  }

  return categoryDisplayLabels[category] ?? category;
}

export function getDocumentRowKey(row: DocumentListItem) {
  return row.id;
}

export function DocumentsTable({
  rows,
  selectedRowKeys = [],
  isSelectionDisabled = false,
  onSelectedRowKeysChange,
  onViewDocument,
  onPrefetchDocument,
}: DocumentsTableProps) {
  const selectedRowKeySet = new Set(selectedRowKeys);
  const selectableRowKeys = rows.map(getDocumentRowKey);
  const isAllRowsSelected =
    selectableRowKeys.length > 0 &&
    selectableRowKeys.every((rowKey) => selectedRowKeySet.has(rowKey));
  const hasSelectedRows = selectableRowKeys.some((rowKey) =>
    selectedRowKeySet.has(rowKey),
  );

  const handleSelectAllRowsChange = (selected: boolean) => {
    onSelectedRowKeysChange?.(selected ? selectableRowKeys : []);
  };

  const handleSelectRowChange = (rowKey: string, selected: boolean) => {
    const nextSelectedRowKeys = new Set(selectedRowKeys);

    if (selected) {
      nextSelectedRowKeys.add(rowKey);
    } else {
      nextSelectedRowKeys.delete(rowKey);
    }

    onSelectedRowKeysChange?.(
      selectableRowKeys.filter((selectableRowKey) =>
        nextSelectedRowKeys.has(selectableRowKey),
      ),
    );
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr className={styles.headerRow}>
            <th className={`${styles.headerCell} ${styles.selectHeaderCell}`}>
              <HeaderSelectionCheckbox
                checked={isAllRowsSelected}
                disabled={isSelectionDisabled}
                indeterminate={hasSelectedRows && !isAllRowsSelected}
                onCheckedChange={handleSelectAllRowsChange}
              />
            </th>
            <th className={styles.headerCell}>Document name</th>
            <th className={styles.headerCell}>Patient Name</th>
            <th className={styles.headerCell}>Category suggestion</th>
            <th className={styles.headerCell}>Confidence</th>
            <th className={styles.headerCell}>Status</th>
            <th className={`${styles.headerCell} ${styles.actionsHeaderCell}`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {rows.length === 0 ? (
            <tr className={styles.bodyRow}>
              <td
                className={`${styles.bodyCell} ${styles.emptyCell}`}
                colSpan={7}
              >
                No documents yet.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const rowKey = getDocumentRowKey(row);
              const documentNameBody = (
                <div className={styles.documentName}>
                  <FileTypeIcon
                    fileName={row.name}
                    kind={fileKindForName(row.name)}
                    size="md"
                  />
                  <div className={styles.documentNameText}>
                    <p
                      className={styles.documentNameValue}
                      title={row.name}
                    >
                      {row.name}
                    </p>
                    <time
                      className={styles.documentTimestamp}
                      dateTime={row.createdAt}
                    >
                      {formatDocumentTimestamp(row.createdAt)}
                    </time>
                  </div>
                </div>
              );

              return (
                <tr className={styles.bodyRow} key={rowKey}>
                  <td className={`${styles.bodyCell} ${styles.selectBodyCell}`}>
                    <input
                      aria-label={`Select ${row.name}`}
                      checked={selectedRowKeySet.has(rowKey)}
                      className={styles.selectAllCheckbox}
                      disabled={isSelectionDisabled}
                      onChange={(event) =>
                        handleSelectRowChange(rowKey, event.target.checked)
                      }
                      type="checkbox"
                    />
                  </td>
                  <td
                    className={`${styles.bodyCell} ${styles.documentNameCell}`}
                  >
                    {onViewDocument ? (
                      <button
                        aria-label={`View document ${row.name}`}
                        className={styles.documentNameButton}
                        type="button"
                        onClick={() => onViewDocument(rowKey)}
                        onMouseEnter={() => onPrefetchDocument?.(rowKey)}
                      >
                        {documentNameBody}
                      </button>
                    ) : (
                      documentNameBody
                    )}
                  </td>
                  <td className={`${styles.bodyCell} ${styles.mutedCell}`}>
                    <Pill variant="neutral">{row.patient ?? "Unknown"}</Pill>
                  </td>
                  <td className={`${styles.bodyCell} ${styles.mutedCell}`}>
                    <Pill variant="warning">
                      {formatCategoryForDisplay(row.category)}
                    </Pill>
                  </td>
                  <td className={`${styles.bodyCell} ${styles.numericCell}`}>
                    <Pill variant={getConfidencePillVariant(row)}>
                      {formatConfidenceColumn(row)}
                    </Pill>
                  </td>
                  <td className={`${styles.bodyCell} ${styles.statusCell}`}>
                    <Pill variant={getStatusPillVariant(row.status)}>
                      {formatStatusForDisplay(row.status)}
                    </Pill>
                  </td>
                  <td
                    className={`${styles.bodyCell} ${styles.actionsBodyCell}`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label={`Open actions for ${row.name}`}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <EllipsisIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={!onViewDocument}
                          onSelect={() => onViewDocument?.(rowKey)}
                        >
                          <EyeIcon />
                          View document
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

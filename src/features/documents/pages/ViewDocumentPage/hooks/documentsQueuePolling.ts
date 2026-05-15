import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useListDocumentsQuery } from "@/features/documents/documentsApi";
import {
  processingDocumentsCompleted,
  processingDocumentsFailed,
} from "@/features/documents/documentsSlice";
import type { AppDispatch, RootState } from "@/store";

/** Match worker list polling; keep in sync with Documents page list polling. */
export const DOCUMENTS_QUEUE_POLL_MS = 1200;
export const DOCUMENTS_QUEUE_LIST_LIMIT = 500;

export function formatDocumentsQueueBadgeCount(count: number) {
  if (count > 99) return "99+";
  return String(count);
}

/**
 * Subscribes to `/documents` (first page, large limit) while any IDs are being
 * watched after "Process Documents", and reconciles Redux when rows reach
 * terminal status. Mount this from a component that stays mounted even when
 * the shell sidebar is not (e.g. full-screen document viewer).
 */
export function useDocumentsProcessingListSubscription() {
  const dispatch = useDispatch<AppDispatch>();
  const processingDocumentIds = useSelector(
    (state: RootState) => state.documents.processingDocumentIds,
  );

  const listArg = useMemo(
    () => ({ page: 1, limit: DOCUMENTS_QUEUE_LIST_LIMIT }),
    [],
  );
  const pollMs =
    processingDocumentIds.length > 0 ? DOCUMENTS_QUEUE_POLL_MS : 0;
  const { data } = useListDocumentsQuery(listArg, {
    pollingInterval: pollMs,
    skipPollingIfUnfocused: true,
  });

  useEffect(() => {
    if (processingDocumentIds.length === 0) return;
    const rows = data?.documents;
    if (rows == null) return;

    const statusById = new Map(rows.map((row) => [row.id, row.status]));
    const rowById = new Map(rows.map((row) => [row.id, row]));
    const completed: { id: string; name: string }[] = [];
    const failedIds: string[] = [];

    for (const id of processingDocumentIds) {
      const status = statusById.get(id);
      if (status === "completed") {
        const row = rowById.get(id);
        completed.push({
          id,
          name: row?.name?.trim() ? row.name : "Document",
        });
      } else if (status === "failed") failedIds.push(id);
    }

    if (completed.length > 0) {
      dispatch(processingDocumentsCompleted(completed));
    }
    if (failedIds.length > 0) {
      dispatch(processingDocumentsFailed(failedIds));
    }
  }, [dispatch, processingDocumentIds, data?.documents]);
}

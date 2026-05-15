import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/elements/Pagination/Pagination";
import {
  DocumentsTable,
  getDocumentRowKey,
} from "@/features/documents/Components/DocumentsTable/DocumentsTable";
import {
  documentIdsFromListData,
  documentsApi,
  useListDocumentsQuery,
  useProcessDocumentsMutation,
} from "@/features/documents/documentsApi";
import { setDocumentIds } from "@/features/documents/documentsSlice";
import { Button } from "@/components/ui/button";
import styles from "@/features/documents/pages/DocumentsPage/DocumentsPage.module.scss";
import { Pill } from "@/components/elements/Pill/Pill";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";

const DOCUMENTS_PAGE_SIZE = 13;

/** Aligns with worker progress throttling (~1s); keeps list progress near real-time without SSE. */
const DOCUMENT_LIST_POLL_MS = 1200;

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const [selectedDocumentKeys, setSelectedDocumentKeys] = useState<string[]>(
    [],
  );
  const listQueryArg = useMemo(
    () => ({ page, limit: DOCUMENTS_PAGE_SIZE }),
    [page],
  );
  const listQueryState = useSelector(
    documentsApi.endpoints.listDocuments.select(listQueryArg),
  );
  const listPollMs =
    listQueryState.data?.documents?.some((d) => d.status === "processing") ===
    true
      ? DOCUMENT_LIST_POLL_MS
      : 0;
  const { data, isLoading, isError } = useListDocumentsQuery(listQueryArg, {
    pollingInterval: listPollMs,
    skipPollingIfUnfocused: true,
  });
  const [processDocuments, { isLoading: isProcessingDocuments }] =
    useProcessDocumentsMutation();
  const documents = React.useMemo(
    () => data?.documents ?? [],
    [data?.documents],
  );

  useEffect(() => {
    if (
      data?.totalPages != null &&
      data.totalPages > 0 &&
      page > data.totalPages
    ) {
      setPage(data.totalPages);
    }
  }, [data?.totalPages, page]);

  useEffect(() => {
    const visibleDocumentKeys = new Set(documents.map(getDocumentRowKey));

    dispatch(setDocumentIds(documentIdsFromListData(data)));

    setSelectedDocumentKeys((currentSelectedDocumentKeys) =>
      currentSelectedDocumentKeys.filter((documentKey) =>
        visibleDocumentKeys.has(documentKey),
      ),
    );
  }, [data, dispatch, documents]);

  const handleProcessDocuments = async () => {
    if (selectedDocumentKeys.length === 0) return;

    await processDocuments({
      documentIds: selectedDocumentKeys,
    }).unwrap();

    setSelectedDocumentKeys([]);
  };

  const prefetchDocument = useCallback(
    (documentId: string) => {
      void dispatch(
        documentsApi.util.prefetch("getDocumentContent", documentId, {
          force: false,
        }),
      );
    },
    [dispatch],
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tablePanel}>
        {isLoading ? (
          <p className={styles.feedback}>Loading documents…</p>
        ) : isError ? (
          <p className={styles.feedback}>Could not load documents.</p>
        ) : (
          <div className={styles.tablePanelBody}>
            <header className={styles.tableHeader}>
              <div className={styles.tableHeaderTitleGroup}>
                <h1 className={styles.tableHeaderTitle}>Document Queue</h1>
                <Pill variant="neutral">{data?.total ?? 0} Items</Pill>
              </div>
              <div className={styles.tableHeaderActions}>
                <Button
                  className={styles.approveButton}
                  disabled={
                    selectedDocumentKeys.length === 0 || isProcessingDocuments
                  }
                  onClick={handleProcessDocuments}
                  type="button"
                >
                  {isProcessingDocuments ? "Processing…" : "Process Documents"}
                </Button>
              </div>
            </header>
            <DocumentsTable
              rows={documents}
              selectedRowKeys={selectedDocumentKeys}
              onPrefetchDocument={prefetchDocument}
              onSelectedRowKeysChange={setSelectedDocumentKeys}
              onViewDocument={(documentId) => {
                navigate(`/documents/${documentId}`);
              }}
            />
            <Pagination
              limit={data?.limit ?? DOCUMENTS_PAGE_SIZE}
              page={data?.page ?? page}
              total={data?.total ?? 0}
              totalPages={data?.totalPages ?? 0}
              itemLabel="documents"
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

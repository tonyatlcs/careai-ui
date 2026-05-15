import { useDocumentsProcessingListSubscription } from "@/features/documents/pages/ViewDocumentPage/hooks/documentsQueuePolling";

/**
 * Keeps processing / completed-queue Redux state in sync with `/documents` list
 * data while the user is on routes without the app shell (e.g. full-screen
 * document viewer). Renders nothing.
 */
export function DocumentsProcessingSync() {
  useDocumentsProcessingListSubscription();
  return null;
}

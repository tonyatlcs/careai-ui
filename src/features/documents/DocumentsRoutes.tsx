import { Navigate, Route, Routes } from "react-router-dom";
import { DocumentsPage } from "@/features/documents/pages/DocumentsPage/DocumentsPage";

/**
 * In-layout routes under `/documents/*` (list + unknown nested paths).
 * `/documents/:documentId` is registered in `App.tsx` outside `AppLayout` so the
 * viewer is full-screen without the default shell.
 */
export function DocumentsRoutes() {
  return (
    <Routes>
      <Route index element={<DocumentsPage />} />
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
}

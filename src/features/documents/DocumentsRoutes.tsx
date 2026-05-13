import { Navigate, Route, Routes } from "react-router-dom";
import { DocumentsPage } from "@/features/documents/pages/DocumentsPage";

export function DocumentsRoutes() {
  return (
    <Routes>
      <Route index element={<DocumentsPage />} />
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
}

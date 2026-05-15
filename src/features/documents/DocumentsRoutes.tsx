import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DocumentsPage } from "@/features/documents/pages/DocumentsPage/DocumentsPage";

const ViewDocumentPage = lazy(() =>
  import("@/features/documents/pages/ViewDocumentPage/ViewDocumentPage").then(
    (m) => ({ default: m.ViewDocumentPage }),
  ),
);

function ViewDocumentFallback() {
  return (
    <p
      style={{
        margin: 0,
        padding: "2rem",
        textAlign: "center",
        color: "#64748b",
        fontSize: "0.875rem",
      }}
    >
      Loading document viewer…
    </p>
  );
}

export function DocumentsRoutes() {
  return (
    <Routes>
      <Route index element={<DocumentsPage />} />
      <Route
        path=":documentId"
        element={
          <Suspense fallback={<ViewDocumentFallback />}>
            <ViewDocumentPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
}

import { Suspense, lazy } from "react";

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

export function ViewDocumentRoute() {
  return (
    <Suspense fallback={<ViewDocumentFallback />}>
      <ViewDocumentPage />
    </Suspense>
  );
}

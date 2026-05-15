import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.tsx";
import "./index.css";
import { DocumentsProcessingSync } from "@/features/documents/DocumentsProcessingSync.tsx";
import { StoreProvider } from "@/providers/StoreProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <DocumentsProcessingSync />
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);

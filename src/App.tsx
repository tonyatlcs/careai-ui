import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardRoutes } from "@/features/dashboard/DashboardRoutes";
import { DocumentsRoutes } from "@/features/documents/DocumentsRoutes";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard/*" element={<DashboardRoutes />} />
        <Route path="documents/*" element={<DocumentsRoutes />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

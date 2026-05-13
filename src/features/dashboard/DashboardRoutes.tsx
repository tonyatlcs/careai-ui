import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage/DashboardPage";

export function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

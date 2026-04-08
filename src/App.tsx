import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { TourProvider } from "@/components/tour/TourProvider";
import { DashboardPage } from "@/pages/DashboardPage";
import { TimerPage } from "@/pages/TimerPage";
import { ClientsPage } from "@/pages/ClientsPage";
import { PipelinePage } from "@/pages/PipelinePage";
import { ChecklistsPage } from "@/pages/ChecklistsPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ReferralsPage } from "@/pages/ReferralsPage";
import { SettingsPage } from "@/pages/SettingsPage";

function AppRoutes() {
  return (
    <TourProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/checklists" element={<ChecklistsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </TourProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoute>
          <AppRoutes />
        </ProtectedRoute>
      </AuthProvider>
    </BrowserRouter>
  );
}

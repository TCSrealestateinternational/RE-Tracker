import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { ClientLayout } from "@/components/layout/ClientLayout";
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
import { FinancesPage } from "@/pages/FinancesPage";
import { AgentMessagesPage } from "@/pages/AgentMessagesPage";
import { ClientHomePage } from "@/pages/client/ClientHomePage";
import { ClientJourneyPage } from "@/pages/client/ClientJourneyPage";
import { ClientMessagesPage } from "@/pages/client/ClientMessagesPage";
import { ClientProfilePage } from "@/pages/client/ClientProfilePage";

function AgentApp() {
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
          <Route path="/messages" element={<AgentMessagesPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/finances" element={<FinancesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </TourProvider>
  );
}

function ClientApp() {
  return (
    <ClientLayout>
      <Routes>
        <Route path="/" element={<ClientHomePage />} />
        <Route path="/journey" element={<ClientJourneyPage />} />
        <Route path="/messages" element={<ClientMessagesPage />} />
        <Route path="/profile" element={<ClientProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClientLayout>
  );
}

function RoleRouter() {
  const { isAgent } = useAuth();
  return isAgent ? <AgentApp /> : <ClientApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoute>
          <RoleRouter />
        </ProtectedRoute>
      </AuthProvider>
    </BrowserRouter>
  );
}

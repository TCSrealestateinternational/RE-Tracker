import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TimerPage } from "@/pages/TimerPage";
import { ClientsPage } from "@/pages/ClientsPage";
import { PipelinePage } from "@/pages/PipelinePage";
import { ChecklistsPage } from "@/pages/ChecklistsPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ReferralsPage } from "@/pages/ReferralsPage";

// Portal pages
import { PortalTimelinePage } from "@/pages/portal/PortalTimelinePage";
import { PortalGlossaryPage } from "@/pages/portal/PortalGlossaryPage";
import { PortalCostsPage } from "@/pages/portal/PortalCostsPage";
import { PortalEducationPage } from "@/pages/portal/PortalEducationPage";
import { PortalDecisionsPage } from "@/pages/portal/PortalDecisionsPage";
import { PortalMarketPage } from "@/pages/portal/PortalMarketPage";
import { PortalMessagesPage } from "@/pages/portal/PortalMessagesPage";

function AppRoutes() {
  const { role } = useAuth();

  if (role === "client") {
    return (
      <ClientLayout>
        <Routes>
          <Route path="/portal" element={<PortalTimelinePage />} />
          <Route path="/portal/glossary" element={<PortalGlossaryPage />} />
          <Route path="/portal/costs" element={<PortalCostsPage />} />
          <Route path="/portal/education" element={<PortalEducationPage />} />
          <Route path="/portal/decisions" element={<PortalDecisionsPage />} />
          <Route path="/portal/market" element={<PortalMarketPage />} />
          <Route path="/portal/messages" element={<PortalMessagesPage />} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
      </ClientLayout>
    );
  }

  return (
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
        {/* Agent can also view portal pages for their clients */}
        <Route path="/portal/messages" element={<PortalMessagesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
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

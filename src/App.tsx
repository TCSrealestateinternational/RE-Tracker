import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TimerPage } from "@/pages/TimerPage";
import { ClientsPage } from "@/pages/ClientsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/clients" element={<ClientsPage />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      </AuthProvider>
    </BrowserRouter>
  );
}

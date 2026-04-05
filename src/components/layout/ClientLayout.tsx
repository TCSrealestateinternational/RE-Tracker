import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientSidebar } from "./ClientSidebar";
import { Header } from "./Header";
import { t } from "@/styles/theme";

export function ClientLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: t.font }}>
      <ClientSidebar
        activePath={location.pathname}
        onNavigate={navigate}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header />
        <main className="main-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { t } from "@/styles/theme";

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: t.font }}>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Sidebar
        activePath={location.pathname}
        onNavigate={navigate}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main id="main-content" className="main-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

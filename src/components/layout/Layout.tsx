import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { theme } from "@/styles/theme";

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: theme.font }}>
      <Sidebar activePath={location.pathname} onNavigate={navigate} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "1.5rem", background: theme.colors.gray50 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

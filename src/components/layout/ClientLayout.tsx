import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { t } from "@/styles/theme";

interface ClientLayoutProps {
  children: ReactNode;
  unreadMessages?: number;
}

export function ClientLayout({ children, unreadMessages = 0 }: ClientLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: t.font,
      background: t.bg,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Frosted top bar */}
      <header
        className="frosted-glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${t.border}`,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{
          fontFamily: t.fontHeadline,
          fontSize: "18px",
          fontWeight: 400,
          fontStyle: "italic",
          color: t.text,
          letterSpacing: "-0.01em",
        }}>
          Hearth
        </span>
      </header>

      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <main
        id="main-content"
        style={{
          flex: 1,
          padding: "20px 16px 100px",
          maxWidth: "600px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {children}
      </main>

      <BottomNav
        activePath={location.pathname}
        onNavigate={navigate}
        unreadMessages={unreadMessages}
      />
    </div>
  );
}

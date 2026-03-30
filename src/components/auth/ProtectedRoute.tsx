import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "./LoginForm";
import { t } from "@/styles/theme";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.bg,
        color: t.textTertiary,
        fontFamily: t.font,
        ...t.body,
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return <>{children}</>;
}

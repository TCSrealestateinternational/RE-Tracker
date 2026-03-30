import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "./LoginForm";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return <>{children}</>;
}

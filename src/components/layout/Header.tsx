import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { t } from "@/styles/theme";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "16px 32px",
      background: "transparent",
    }}>
      <span style={{ ...t.caption, color: t.textTertiary, marginRight: "16px" }}>
        {user?.email}
      </span>
      <button
        onClick={signOut}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          background: "transparent",
          border: `1px solid ${t.border}`,
          borderRadius: "6px",
          fontSize: "13px",
          cursor: "pointer",
          color: t.textTertiary,
          fontFamily: t.font,
          transition: "border-color 0.12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.borderMedium; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
      >
        <LogOut size={14} strokeWidth={1.5} />
        Sign out
      </button>
    </header>
  );
}

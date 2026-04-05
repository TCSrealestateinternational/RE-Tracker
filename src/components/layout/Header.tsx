import { LogOut, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTour } from "@/components/tour/useTour";
import { t } from "@/styles/theme";

export function Header() {
  const { user, signOut } = useAuth();
  const { startTour } = useTour();

  return (
    <header className="header" style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      background: "transparent",
    }}>
      <button
        onClick={() => startTour()}
        title="Start guided tour"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 12px",
          background: "transparent",
          border: `1px solid ${t.border}`,
          borderRadius: "6px",
          fontSize: "13px",
          cursor: "pointer",
          color: t.textTertiary,
          fontFamily: t.font,
          marginRight: "8px",
          transition: "border-color 0.12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.borderMedium; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
      >
        <HelpCircle size={14} strokeWidth={1.5} />
        Tour
      </button>
      <span className="email-truncate" style={{ ...t.caption, color: t.textTertiary, marginRight: "16px" }}>
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

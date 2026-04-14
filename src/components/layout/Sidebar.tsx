import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTour } from "@/components/tour/useTour";
import { Icon } from "@/components/shared/Icon";
import { t } from "@/styles/theme";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "dashboard" },
  { label: "Timer", path: "/timer", icon: "timer" },
  { label: "Clients", path: "/clients", icon: "group" },
  { label: "Pipeline", path: "/pipeline", icon: "account_tree" },
  { label: "Referrals", path: "/referrals", icon: "handshake" },
  { label: "Checklists", path: "/checklists", icon: "checklist" },
  { label: "Goals", path: "/goals", icon: "ads_click" },
  { label: "Reports", path: "/reports", icon: "analytics" },
  { label: "Settings", path: "/settings", icon: "settings" },
];

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ activePath, onNavigate, open, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { startTour } = useTour();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "RE";

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onToggle();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onToggle]);

  return (
    <>
      <button className="hamburger" onClick={onToggle} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      {/* Backdrop */}
      <div
        className={`sidebar-backdrop${open ? " sidebar-backdrop-visible" : ""}`}
        onClick={onToggle}
        aria-hidden="true"
      />

      <aside
        className={`sidebar${open ? " sidebar-open" : ""}`}
        aria-label="Main navigation"
        style={{
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          padding: "28px 0",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "0 24px", marginBottom: "32px" }}>
          <span style={{
            ...t.eyebrow,
            color: t.gold,
            display: "block",
            marginBottom: "4px",
          }}>
            Agent
          </span>
          <span style={{
            fontFamily: t.fontHeadline,
            fontSize: "22px",
            fontWeight: 400,
            fontStyle: "italic",
            color: t.text,
            letterSpacing: "-0.01em",
          }}>
            RE Tracker
          </span>
        </div>

        {/* User avatar */}
        {user?.email && (
          <div style={{
            padding: "0 24px", marginBottom: "24px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: t.teal, color: t.textInverse,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, fontFamily: t.font,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <span style={{
              ...t.caption,
              color: t.textTertiary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {user.email}
            </span>
          </div>
        )}

        <nav data-tour="sidebar-nav" style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = activePath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  onToggle();
                }}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 24px",
                  background: active ? t.sidebarActive : "transparent",
                  border: "none",
                  borderLeft: active ? `3px solid ${t.gold}` : "3px solid transparent",
                  color: active ? t.teal : t.textSecondary,
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "background 0.12s, color 0.12s, transform 0.12s",
                  fontFamily: t.font,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = t.sidebarHover;
                    e.currentTarget.style.transform = "translateX(2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <Icon name={item.icon} size={18} filled={active} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: "4px" }}>
          <button
            onClick={() => startTour()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "9px 0",
              background: "transparent",
              border: "none",
              color: t.textTertiary,
              textAlign: "left",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: t.font,
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.textTertiary; }}
          >
            <Icon name="help" size={18} />
            Tour
          </button>
          <button
            onClick={signOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "9px 0",
              background: "transparent",
              border: "none",
              color: t.textTertiary,
              textAlign: "left",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: t.font,
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.textTertiary; }}
          >
            <Icon name="logout" size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

import {
  LayoutDashboard, Clock, Users, Kanban, Gift, ClipboardCheck, Target, BarChart3, Settings, LogOut, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTour } from "@/components/tour/useTour";
import { t } from "@/styles/theme";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Timer", path: "/timer", icon: Clock },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Pipeline", path: "/pipeline", icon: Kanban },
  { label: "Referrals", path: "/referrals", icon: Gift },
  { label: "Checklists", path: "/checklists", icon: ClipboardCheck },
  { label: "Goals", path: "/goals", icon: Target },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
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

  return (
    <>
      <button className="hamburger" onClick={onToggle} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      {/* Backdrop */}
      <div
        className={`sidebar-backdrop${open ? " sidebar-backdrop-visible" : ""}`}
        onClick={onToggle}
      />

      <aside
        className={`sidebar${open ? " sidebar-open" : ""}`}
        style={{
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          padding: "28px 0",
        }}
      >
        <div style={{ padding: "0 24px", marginBottom: "36px" }}>
          <span style={{
            ...t.label,
            color: t.textTertiary,
            display: "block",
            marginBottom: "2px",
          }}>
            Agent
          </span>
          <span style={{
            fontSize: "17px",
            fontWeight: 700,
            color: t.text,
            letterSpacing: "-0.01em",
          }}>
            RE Tracker
          </span>
        </div>
        <nav data-tour="sidebar-nav" style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = activePath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  onToggle();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 24px",
                  background: active ? t.sidebarActive : "transparent",
                  border: "none",
                  color: active ? t.teal : t.textSecondary,
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                  fontFamily: t.font,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = t.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: "4px" }}>
          {user?.email && (
            <span style={{
              ...t.caption,
              color: t.textTertiary,
              padding: "4px 0 8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {user.email}
            </span>
          )}
          <button
            onClick={() => startTour()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
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
            <HelpCircle size={16} strokeWidth={1.5} />
            Tour
          </button>
          <button
            onClick={signOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
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
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

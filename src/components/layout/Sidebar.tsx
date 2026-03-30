import {
  LayoutDashboard, Clock, Users, Kanban, ClipboardCheck, Target, BarChart3,
} from "lucide-react";
import { t } from "@/styles/theme";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Timer", path: "/timer", icon: Clock },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Pipeline", path: "/pipeline", icon: Kanban },
  { label: "Checklists", path: "/checklists", icon: ClipboardCheck },
  { label: "Goals", path: "/goals", icon: Target },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ activePath, onNavigate }: SidebarProps) {
  return (
    <aside style={{
      width: "228px",
      background: t.sidebar,
      borderRight: `1px solid ${t.border}`,
      padding: "28px 0",
      minHeight: "100vh",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    }}>
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
          Time Tracker
        </span>
      </div>
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = activePath === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
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
    </aside>
  );
}

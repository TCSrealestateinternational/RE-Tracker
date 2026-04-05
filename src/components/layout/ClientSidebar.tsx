import {
  BookOpen, Milestone, DollarSign, HelpCircle, ClipboardList, TrendingUp, MessageSquare,
} from "lucide-react";
import { t } from "@/styles/theme";

const NAV_ITEMS = [
  { label: "Timeline", path: "/portal", icon: Milestone },
  { label: "Glossary", path: "/portal/glossary", icon: BookOpen },
  { label: "Costs", path: "/portal/costs", icon: DollarSign },
  { label: "Is This Normal?", path: "/portal/education", icon: HelpCircle },
  { label: "Decisions", path: "/portal/decisions", icon: ClipboardList },
  { label: "Market", path: "/portal/market", icon: TrendingUp },
  { label: "Messages", path: "/portal/messages", icon: MessageSquare },
];

interface ClientSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  open: boolean;
  onToggle: () => void;
}

export function ClientSidebar({ activePath, onNavigate, open, onToggle }: ClientSidebarProps) {
  return (
    <>
      <button className="hamburger" onClick={onToggle} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

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
            color: t.teal,
            display: "block",
            marginBottom: "2px",
          }}>
            Client Portal
          </span>
          <span style={{
            fontSize: "17px",
            fontWeight: 700,
            color: t.text,
            letterSpacing: "-0.01em",
          }}>
            My Transaction
          </span>
        </div>
        <nav style={{ flex: 1 }}>
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
      </aside>
    </>
  );
}

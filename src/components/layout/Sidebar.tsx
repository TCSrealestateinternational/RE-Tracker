import { theme } from "@/styles/theme";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Timer", path: "/timer" },
  { label: "Clients", path: "/clients" },
];

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ activePath, onNavigate }: SidebarProps) {
  return (
    <aside style={{
      width: "220px",
      background: theme.colors.teal,
      color: theme.colors.white,
      padding: "1.5rem 0",
      minHeight: "100vh",
      flexShrink: 0,
    }}>
      <h2 style={{
        padding: "0 1.25rem",
        fontSize: "1.1rem",
        fontWeight: 800,
        marginBottom: "2rem",
        color: theme.colors.gold,
      }}>
        Agent Time Tracker
      </h2>
      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            style={{
              display: "block",
              width: "100%",
              padding: "0.75rem 1.25rem",
              background: activePath === item.path ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              color: theme.colors.white,
              textAlign: "left",
              fontSize: "0.9rem",
              fontWeight: activePath === item.path ? 600 : 400,
              cursor: "pointer",
              borderLeft: activePath === item.path ? `3px solid ${theme.colors.gold}` : "3px solid transparent",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

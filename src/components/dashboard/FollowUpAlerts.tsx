import { theme } from "@/styles/theme";
import { todayStr } from "@/utils/dates";
import type { Client } from "@/types";

interface FollowUpAlertsProps {
  clients: Client[];
  onClientClick: (path: string) => void;
}

export function FollowUpAlerts({ clients, onClientClick }: FollowUpAlertsProps) {
  const today = todayStr();
  const due = clients.filter((c) => c.followUpDate && c.followUpDate <= today);

  if (due.length === 0) {
    return (
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "0.5rem" }}>Follow-Ups</h3>
        <p style={{ fontSize: "0.85rem", color: theme.colors.gray500 }}>No follow-ups due today.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h3 style={{ fontSize: "0.95rem", color: theme.colors.rust, marginBottom: "0.75rem" }}>
        Follow-Ups Due ({due.length})
      </h3>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        {due.map((c) => (
          <button
            key={c.id}
            onClick={() => onClientClick("/clients")}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.5rem 0.75rem", background: "#fef2f2", border: "none",
              borderRadius: "6px", cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "0.85rem", color: theme.colors.gray900 }}>{c.name}</span>
            <span style={{ fontSize: "0.75rem", color: theme.colors.rust }}>{c.followUpDate}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

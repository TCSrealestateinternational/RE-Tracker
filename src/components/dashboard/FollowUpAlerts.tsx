import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import { todayStr } from "@/utils/dates";
import type { Client } from "@/types";

interface FollowUpAlertsProps {
  clients: Client[];
  onClientClick: (path: string) => void;
}

export function FollowUpAlerts({ clients, onClientClick }: FollowUpAlertsProps) {
  const today = todayStr();
  const due = clients.filter((c) => c.followUpDate && c.followUpDate <= today);

  return (
    <div data-tour="follow-ups" style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Icon name="notifications" size={18} color={due.length > 0 ? t.rust : t.textTertiary} />
        <h3 style={{ ...t.sectionHeader, color: t.text }}>Follow-Ups</h3>
      </div>
      {due.length === 0 ? (
        <p style={{ ...t.body, color: t.textTertiary }}>
          No follow-ups due today. You're all caught up.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "6px" }}>
          {due.map((c) => (
            <button
              key={c.id}
              className="hover-slide"
              onClick={() => onClientClick("/clients")}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: t.rustLight, border: "none",
                borderRadius: "8px", cursor: "pointer", width: "100%", textAlign: "left",
                fontFamily: t.font,
                transition: "transform 0.15s, background 0.15s",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: "14px", color: t.text }}>{c.name}</span>
              <span style={{ ...t.caption, color: t.rust }}>{c.followUpDate}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

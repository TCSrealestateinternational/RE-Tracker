import { Bell } from "lucide-react";
import { t, card } from "@/styles/theme";
import { todayStr, formatDate } from "@/utils/dates";
import { isReminderDue } from "@/utils/reminders";
import type { Client } from "@/types";

interface OneYearRemindersProps {
  clients: Client[];
  onOpenClient: (client: Client) => void;
  onDismiss: (clientId: string) => Promise<void>;
}

export function OneYearReminders({ clients, onOpenClient, onDismiss }: OneYearRemindersProps) {
  const today = todayStr();
  const due = clients.filter((c) => isReminderDue(c, today));

  if (due.length === 0) return null;

  async function handleReachOut(client: Client) {
    await onDismiss(client.id);
    onOpenClient(client);
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <Bell size={16} color={t.gold} strokeWidth={2} />
        <h3 style={{ ...t.sectionHeader, color: t.text }}>1-Year Reach-Outs</h3>
      </div>
      <div style={{ display: "grid", gap: "8px" }}>
        {due.map((c) => {
          const caption = c.archivedAt
            ? `Closed around ${formatDate(c.archivedAt)}`
            : "Closed ~1 year ago";
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "10px 14px",
                background: t.goldLight,
                borderRadius: "8px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 180px" }}>
                <div style={{ fontWeight: 600, fontSize: "14px", color: t.text }}>
                  {c.name}
                </div>
                <div style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
                  {caption}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => handleReachOut(c)}
                  style={{
                    padding: "6px 12px", fontSize: "12px", fontWeight: 600,
                    fontFamily: t.font,
                    background: t.gold, color: t.textInverse,
                    border: "none", borderRadius: "8px", cursor: "pointer",
                  }}
                >
                  Reach out
                </button>
                <button
                  onClick={() => onDismiss(c.id)}
                  style={{
                    padding: "6px 12px", fontSize: "12px", fontWeight: 600,
                    fontFamily: t.font,
                    background: "transparent", color: t.textSecondary,
                    border: `1px solid ${t.borderMedium}`, borderRadius: "8px", cursor: "pointer",
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

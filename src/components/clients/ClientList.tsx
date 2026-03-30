import { UserPlus, AlertCircle } from "lucide-react";
import { t, card, btnPrimary } from "@/styles/theme";
import { todayStr } from "@/utils/dates";
import type { Client } from "@/types";

interface ClientListProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onAdd: () => void;
}

export function ClientList({ clients, onSelect, onAdd }: ClientListProps) {
  const today = todayStr();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...t.pageTitle, color: t.text }}>Clients</h2>
        <button onClick={onAdd} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
          <UserPlus size={16} strokeWidth={2} />
          Add Client
        </button>
      </div>
      <div style={{ display: "grid", gap: "8px" }}>
        {clients.map((c) => {
          const followUpDue = c.followUpDate != null && c.followUpDate <= today;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              style={{
                ...card,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", textAlign: "left", width: "100%",
                padding: "16px 20px",
                transition: "background 0.12s",
                fontFamily: t.font,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: t.text }}>{c.name}</span>
                  {followUpDue && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <AlertCircle size={12} color={t.rust} strokeWidth={2} />
                      <span style={{ ...t.caption, color: t.rust, fontWeight: 500 }}>Follow-up due</span>
                    </span>
                  )}
                </div>
                <div style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
                  {c.status} &middot; {c.stage}
                  {c.leadSource && <> &middot; {c.leadSource}</>}
                </div>
              </div>
              {c.commissionEarned > 0 && (
                <span style={{ fontWeight: 600, fontSize: "14px", color: t.gold }}>
                  ${c.commissionEarned.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
        {clients.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ ...t.body, color: t.textTertiary, marginBottom: "4px" }}>
              No clients yet.
            </p>
            <p style={{ ...t.caption, color: t.textTertiary }}>
              Add your first client to start tracking your time and commissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

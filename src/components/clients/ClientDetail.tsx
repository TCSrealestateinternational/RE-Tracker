import { theme } from "@/styles/theme";
import type { Client, TimeEntry } from "@/types";

interface ClientDetailProps {
  client: Client;
  entries: TimeEntry[];
  onEdit: () => void;
  onBack: () => void;
}

export function ClientDetail({ client, entries, onEdit, onBack }: ClientDetailProps) {
  const clientEntries = entries.filter((e) => e.clientId === client.id);
  const totalMs = clientEntries.reduce((sum, e) => sum + e.durationMs, 0);
  const totalHours = totalMs / 3_600_000;
  const revenuePerHour = totalHours > 0 ? client.commissionEarned / totalHours : 0;

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: theme.colors.gold,
        cursor: "pointer", marginBottom: "1rem", padding: 0, fontWeight: 600, fontSize: "0.85rem",
      }}>
        &larr; Back to Clients
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ color: theme.colors.teal, marginBottom: "0.25rem" }}>{client.name}</h2>
          <p style={{ fontSize: "0.85rem", color: theme.colors.gray500 }}>
            {client.status} &middot; {client.stage}
            {client.leadSource && <> &middot; {client.leadSource}</>}
            &middot; {client.email || "no email"} &middot; {client.phone || "no phone"}
          </p>
        </div>
        <button onClick={onEdit} style={{
          padding: "0.5rem 1rem", background: theme.colors.gold, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          Edit
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: theme.colors.gray50, padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.teal }}>{totalHours.toFixed(1)}h</div>
          <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Hours Logged</div>
        </div>
        <div style={{ background: theme.colors.gray50, padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.gold }}>
            ${client.commissionEarned.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Commission</div>
        </div>
        <div style={{ background: theme.colors.gray50, padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.rust }}>
            ${revenuePerHour.toFixed(0)}/hr
          </div>
          <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Revenue/Hour</div>
        </div>
        <div style={{ background: theme.colors.gray50, padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: client.followUpDate ? theme.colors.rust : theme.colors.gray300 }}>
            {client.followUpDate || "—"}
          </div>
          <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Follow-Up</div>
        </div>
      </div>

      {client.searchCriteria && (
        <p style={{ fontSize: "0.85rem", color: theme.colors.gray700, marginBottom: "0.5rem" }}>
          <strong>Search Criteria:</strong> {client.searchCriteria}
        </p>
      )}
      {client.notes && (
        <p style={{ fontSize: "0.85rem", color: theme.colors.gray700 }}>
          <strong>Notes:</strong> {client.notes}
        </p>
      )}
    </div>
  );
}

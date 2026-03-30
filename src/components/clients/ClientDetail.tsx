import { ArrowLeft, Edit3, Clock, DollarSign, TrendingUp, CalendarClock } from "lucide-react";
import { t, card } from "@/styles/theme";
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

  const stats = [
    { label: "Hours Logged", value: `${totalHours.toFixed(1)}h`, color: t.teal, icon: Clock },
    { label: "Commission", value: `$${client.commissionEarned.toLocaleString()}`, color: t.gold, icon: DollarSign },
    { label: "Revenue/Hour", value: `$${revenuePerHour.toFixed(0)}`, color: t.teal, icon: TrendingUp },
    { label: "Follow-Up", value: client.followUpDate || "—", color: client.followUpDate ? t.rust : t.textTertiary, icon: CalendarClock },
  ];

  return (
    <div style={card}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: t.textTertiary,
        cursor: "pointer", padding: 0, fontFamily: t.font,
        display: "flex", alignItems: "center", gap: "6px",
        ...t.caption, marginBottom: "20px",
      }}>
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Clients
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "4px" }}>{client.name}</h2>
          <p style={{ ...t.caption, color: t.textTertiary }}>
            {client.status} &middot; {client.stage}
            {client.leadSource && <> &middot; {client.leadSource}</>}
            {client.email && <> &middot; {client.email}</>}
            {client.phone && <> &middot; {client.phone}</>}
          </p>
          {client.additionalContacts?.length > 0 && (
            <p style={{ ...t.caption, color: t.textTertiary, marginTop: "4px" }}>
              Also: {client.additionalContacts.map((c) => {
                const parts = [c.name];
                if (c.email) parts.push(c.email);
                if (c.phone) parts.push(c.phone);
                return parts.join(" — ");
              }).join("; ")}
            </p>
          )}
        </div>
        <button onClick={onEdit} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 16px", background: "transparent", border: `1px solid ${t.border}`,
          borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: t.font,
          color: t.textSecondary,
        }}>
          <Edit3 size={14} strokeWidth={1.5} />
          Edit
        </button>
      </div>

      <div className="grid-4col" style={{ marginBottom: "28px" }}>
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: t.bg, padding: "16px", borderRadius: "8px" }}>
            <Icon size={14} color={t.textTertiary} strokeWidth={1.5} style={{ marginBottom: "8px" }} />
            <div style={{ ...t.stat, fontSize: "20px", color }}>{value}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {client.searchCriteria && (
        <div style={{ marginBottom: "12px" }}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Search Criteria</span>
          <p style={{ ...t.body, color: t.text }}>{client.searchCriteria}</p>
        </div>
      )}
      {client.notes && (
        <div>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Notes</span>
          <p style={{ ...t.body, color: t.text }}>{client.notes}</p>
        </div>
      )}
    </div>
  );
}

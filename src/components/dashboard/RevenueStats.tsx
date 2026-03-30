import { theme } from "@/styles/theme";
import type { Client, TimeEntry } from "@/types";

interface RevenueStatsProps {
  clients: Client[];
  entries: TimeEntry[];
}

export function RevenueStats({ clients, entries }: RevenueStatsProps) {
  const totalGCI = clients.reduce((s, c) => s + c.commissionEarned, 0);
  const totalMs = entries.reduce((s, e) => s + e.durationMs, 0);
  const totalHours = totalMs / 3_600_000;
  const revenuePerHour = totalHours > 0 ? totalGCI / totalHours : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: theme.colors.teal }}>
          {totalHours.toFixed(1)}h
        </div>
        <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Total Hours</div>
      </div>
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: theme.colors.gold }}>
          ${totalGCI.toLocaleString()}
        </div>
        <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Total GCI</div>
      </div>
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: theme.colors.rust }}>
          ${revenuePerHour.toFixed(0)}/hr
        </div>
        <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>Revenue / Hour</div>
      </div>
    </div>
  );
}

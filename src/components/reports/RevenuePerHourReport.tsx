import { theme } from "@/styles/theme";
import type { Client, TimeEntry } from "@/types";
import { getWeekStart, getWeekLabel } from "@/utils/dates";

interface RevenuePerHourReportProps {
  clients: Client[];
  entries: TimeEntry[];
}

export function RevenuePerHourReport({ clients, entries }: RevenuePerHourReportProps) {
  // Last 12 weeks revenue per hour
  const weeks: { label: string; start: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeks.push({ label: getWeekLabel(getWeekStart(d)), start: getWeekStart(d) });
  }

  const totalGCI = clients.reduce((s, c) => s + c.commissionEarned, 0);

  const data = weeks.map((w) => {
    const weekEnd = w.start + 7 * 24 * 60 * 60 * 1000;
    const weekEntries = entries.filter((e) => e.startTime >= w.start && e.startTime < weekEnd);
    const hours = weekEntries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    return { ...w, hours };
  });

  const totalHours = entries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
  const overallRPH = totalHours > 0 ? totalGCI / totalHours : 0;

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal }}>Revenue Per Hour Trend</h3>
        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.colors.rust }}>
          ${overallRPH.toFixed(0)}/hr overall
        </span>
      </div>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {data.map((w) => (
          <div key={w.start} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "50px", fontSize: "0.7rem", color: theme.colors.gray500 }}>{w.label}</span>
            <div style={{ flex: 1, height: "14px", background: theme.colors.gray100, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min((w.hours / 40) * 100, 100)}%`,
                background: theme.colors.rust, borderRadius: "4px",
              }} />
            </div>
            <span style={{ width: "40px", fontSize: "0.7rem", color: theme.colors.gray700, textAlign: "right" }}>
              {w.hours.toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

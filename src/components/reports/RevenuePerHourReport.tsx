import { t, card } from "@/styles/theme";
import type { Client, TimeEntry } from "@/types";
import { getWeekStart, getWeekLabel } from "@/utils/dates";

interface RevenuePerHourReportProps {
  clients: Client[];
  entries: TimeEntry[];
}

export function RevenuePerHourReport({ clients, entries }: RevenuePerHourReportProps) {
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
    <div style={card}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <h3 style={{ ...t.sectionHeader, color: t.text }}>Revenue Per Hour</h3>
        <span style={{ ...t.stat, fontSize: "20px", color: t.teal }}>
          ${overallRPH.toFixed(0)}/hr overall
        </span>
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {data.map((w) => (
          <div key={w.start} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "50px", ...t.caption, color: t.textTertiary }}>{w.label}</span>
            <div style={{ flex: 1, height: "4px", background: t.tealLight, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min((w.hours / 40) * 100, 100)}%`,
                background: t.teal, borderRadius: "2px",
              }} />
            </div>
            <span style={{ width: "40px", textAlign: "right", ...t.caption, color: t.textSecondary, fontWeight: 600 }}>
              {w.hours.toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

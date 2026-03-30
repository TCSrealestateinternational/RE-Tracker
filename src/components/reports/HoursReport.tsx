import { ACTIVITY_CATEGORIES, type TimeEntry } from "@/types";
import { getWeekStart, getWeekLabel } from "@/utils/dates";
import { theme } from "@/styles/theme";

interface HoursReportProps {
  entries: TimeEntry[];
}

export function HoursReport({ entries }: HoursReportProps) {
  // Build last 12 weeks
  const weeks: { label: string; start: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const ws = getWeekStart(d);
    weeks.push({ label: getWeekLabel(ws), start: ws });
  }

  const data = weeks.map((w) => {
    const weekEnd = w.start + 7 * 24 * 60 * 60 * 1000;
    const weekEntries = entries.filter((e) => e.startTime >= w.start && e.startTime < weekEnd);
    const byCategory: Record<string, number> = {};
    for (const cat of ACTIVITY_CATEGORIES) {
      byCategory[cat] = weekEntries
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    }
    const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
    return { ...w, byCategory, total };
  });

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "1rem" }}>
        Hours by Week (Last 12 Weeks)
      </h3>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {data.map((w) => (
          <div key={w.start} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "50px", fontSize: "0.7rem", color: theme.colors.gray500 }}>{w.label}</span>
            <div style={{ flex: 1, height: "14px", background: theme.colors.gray100, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(w.total / maxTotal) * 100}%`,
                background: theme.colors.teal, borderRadius: "4px",
              }} />
            </div>
            <span style={{ width: "40px", fontSize: "0.7rem", color: theme.colors.gray700, textAlign: "right" }}>
              {w.total.toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function getHoursReportData(entries: TimeEntry[]) {
  const weeks: { label: string; start: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeks.push({ label: getWeekLabel(getWeekStart(d)), start: getWeekStart(d) });
  }
  const headers = ["Week", ...ACTIVITY_CATEGORIES.map(String), "Total"];
  const rows = weeks.map((w) => {
    const weekEnd = w.start + 7 * 24 * 60 * 60 * 1000;
    const weekEntries = entries.filter((e) => e.startTime >= w.start && e.startTime < weekEnd);
    const cats = ACTIVITY_CATEGORIES.map((cat) =>
      (weekEntries.filter((e) => e.category === cat).reduce((s, e) => s + e.durationMs, 0) / 3_600_000).toFixed(1)
    );
    const total = cats.reduce((s, v) => s + parseFloat(v), 0).toFixed(1);
    return [w.label, ...cats, total];
  });
  return { headers, rows };
}

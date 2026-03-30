import { ACTIVITY_CATEGORIES, type TimeEntry } from "@/types";
import { getWeekStart, getWeekLabel } from "@/utils/dates";
import { t, card } from "@/styles/theme";

interface HoursReportProps {
  entries: TimeEntry[];
}

export function HoursReport({ entries }: HoursReportProps) {
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
    const total = weekEntries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    return { ...w, total };
  });

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
        Hours by Week
      </h3>
      <div style={{ display: "grid", gap: "10px" }}>
        {data.map((w) => (
          <div key={w.start} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "50px", ...t.caption, color: t.textTertiary }}>{w.label}</span>
            <div style={{ flex: 1, height: "4px", background: t.tealLight, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(w.total / maxTotal) * 100}%`,
                background: t.teal, borderRadius: "2px",
              }} />
            </div>
            <span style={{ width: "40px", textAlign: "right", ...t.caption, color: t.textSecondary, fontWeight: 600 }}>
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

import { ACTIVITY_CATEGORIES, type TimeEntry } from "@/types";
import { t, card } from "@/styles/theme";

const CATEGORY_COLORS: Record<string, string> = {
  "Lead Gen": t.teal,
  "Client Calls": "#6b8e8e",
  "Showings": t.gold,
  "Admin": t.textTertiary,
  "Marketing": "#7c6ca8",
  "Education": t.success,
  "Transaction Coordination": "#b08d57",
  "Home Search": "#8b7d6b",
};

interface WeeklyHoursProps {
  entries: TimeEntry[];
  weekStart: number;
}

export function WeeklyHours({ entries, weekStart }: WeeklyHoursProps) {
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
  const weekEntries = entries.filter(
    (e) => e.startTime >= weekStart && e.startTime < weekEnd
  );

  const hoursByCategory = ACTIVITY_CATEGORIES.map((cat) => {
    const ms = weekEntries
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.durationMs, 0);
    return { category: cat, hours: ms / 3_600_000 };
  });

  const maxHours = Math.max(...hoursByCategory.map((h) => h.hours), 1);

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
        Weekly Hours
      </h3>
      <div style={{ display: "grid", gap: "12px" }}>
        {hoursByCategory.map(({ category, hours }) => (
          <div key={category}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ ...t.caption, color: t.textSecondary }}>{category}</span>
              <span style={{ ...t.caption, color: t.textTertiary }}>{hours.toFixed(1)}h</span>
            </div>
            <div style={{ height: "4px", background: t.tealLight, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(hours / maxHours) * 100}%`,
                background: CATEGORY_COLORS[category] ?? t.teal,
                borderRadius: "2px",
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

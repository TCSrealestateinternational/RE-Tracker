import { ACTIVITY_CATEGORIES, type TimeEntry } from "@/types";
import { theme } from "@/styles/theme";

const CATEGORY_COLORS: Record<string, string> = {
  "Lead Gen": theme.colors.teal,
  "Client Calls": theme.colors.rust,
  "Showings": theme.colors.gold,
  "Admin": theme.colors.gray500,
  "Marketing": "#6366f1",
  "Education": "#10b981",
  "Transaction Coordination": "#f59e0b",
  "Home Search": theme.colors.sand,
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
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>
        Weekly Hours by Category
      </h2>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {hoursByCategory.map(({ category, hours }) => (
          <div key={category}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
              <span style={{ color: theme.colors.gray700 }}>{category}</span>
              <span style={{ color: theme.colors.gray500 }}>{hours.toFixed(1)}h</span>
            </div>
            <div style={{ height: "8px", background: theme.colors.gray100, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(hours / maxHours) * 100}%`,
                background: CATEGORY_COLORS[category] ?? theme.colors.teal,
                borderRadius: "4px",
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { ACTIVITY_CATEGORIES, type TimeEntry } from "@/types";
import { t, card } from "@/styles/theme";

interface GoalProgressProps {
  entries: TimeEntry[];
  weekStart: number;
  goals: Record<string, number>;
}

export function GoalProgress({ entries, weekStart, goals }: GoalProgressProps) {
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
  const weekEntries = entries.filter(
    (e) => e.startTime >= weekStart && e.startTime < weekEnd
  );

  const data = ACTIVITY_CATEGORIES.map((cat) => {
    const actual = weekEntries
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    const goal = goals[cat] ?? 0;
    return { category: cat, actual, goal };
  }).filter((d) => d.goal > 0);

  if (data.length === 0) {
    return (
      <div style={card}>
        <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>
          Goal Progress
        </h3>
        <p style={{ ...t.body, color: t.textTertiary }}>
          Set weekly hour goals to see your progress here. Goals help you stay intentional about where your time goes.
        </p>
      </div>
    );
  }

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
        Goal vs Actual
      </h3>
      <div style={{ display: "grid", gap: "14px" }}>
        {data.map(({ category, actual, goal }) => {
          const pct = Math.min((actual / goal) * 100, 100);
          const met = actual >= goal;
          return (
            <div key={category}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ ...t.caption, color: t.textSecondary }}>{category}</span>
                <span style={{
                  ...t.caption,
                  fontWeight: 600,
                  color: met ? t.success : t.textSecondary,
                }}>
                  {actual.toFixed(1)}h / {goal}h
                </span>
              </div>
              <div style={{ height: "4px", background: t.tealLight, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: met ? t.success : t.gold,
                  borderRadius: "2px",
                  transition: "width 0.3s",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

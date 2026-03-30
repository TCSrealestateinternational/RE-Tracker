import { ACTIVITY_CATEGORIES, type TimeEntry } from "@/types";
import { theme } from "@/styles/theme";

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
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: theme.colors.teal }}>
          Goal Progress
        </h2>
        <p style={{ color: theme.colors.gray500, fontSize: "0.85rem" }}>
          Set weekly hour goals for categories to track progress here.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>
        Goal vs Actual
      </h2>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {data.map(({ category, actual, goal }) => {
          const pct = Math.min((actual / goal) * 100, 100);
          const met = actual >= goal;
          return (
            <div key={category}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                <span style={{ color: theme.colors.gray700 }}>{category}</span>
                <span style={{ color: met ? "#10b981" : theme.colors.rust, fontWeight: 600 }}>
                  {actual.toFixed(1)}h / {goal}h
                </span>
              </div>
              <div style={{ height: "10px", background: theme.colors.gray100, borderRadius: "5px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: met ? "#10b981" : theme.colors.gold,
                  borderRadius: "5px",
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

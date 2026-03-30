import { theme } from "@/styles/theme";
import type { Client, IncomeGoal } from "@/types";

interface IncomeGoalBarProps {
  goal: IncomeGoal | null;
  clients: Client[];
}

export function IncomeGoalBar({ goal, clients }: IncomeGoalBarProps) {
  if (!goal) {
    return (
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "0.5rem" }}>
          Annual Income Goal
        </h3>
        <p style={{ fontSize: "0.85rem", color: theme.colors.gray500 }}>
          Set your annual GCI target in the Goals page.
        </p>
      </div>
    );
  }

  const totalGCI = clients.reduce((s, c) => s + c.commissionEarned, 0);
  const pct = goal.annualTarget > 0 ? Math.min((totalGCI / goal.annualTarget) * 100, 100) : 0;
  const monthsElapsed = new Date().getMonth() + 1;
  const pctOfYear = (monthsElapsed / 12) * 100;

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal }}>Annual Income Goal</h3>
        <span style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>
          ${totalGCI.toLocaleString()} / ${goal.annualTarget.toLocaleString()}
        </span>
      </div>
      <div style={{ position: "relative", height: "12px", background: theme.colors.gray100, borderRadius: "6px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: pct >= pctOfYear ? "#10b981" : theme.colors.rust,
          borderRadius: "6px", transition: "width 0.3s",
        }} />
        <div style={{
          position: "absolute", top: 0, left: `${pctOfYear}%`,
          width: "2px", height: "100%", background: theme.colors.gray900, opacity: 0.3,
        }} />
      </div>
      <div style={{ fontSize: "0.7rem", color: theme.colors.gray500, marginTop: "0.25rem" }}>
        {pct.toFixed(0)}% of goal &middot; {pctOfYear.toFixed(0)}% of year elapsed
      </div>
    </div>
  );
}

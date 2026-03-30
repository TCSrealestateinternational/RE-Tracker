import { Target } from "lucide-react";
import { t, card } from "@/styles/theme";
import type { Client, IncomeGoal } from "@/types";

interface IncomeGoalBarProps {
  goal: IncomeGoal | null;
  clients: Client[];
}

export function IncomeGoalBar({ goal, clients }: IncomeGoalBarProps) {
  if (!goal) {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Target size={16} color={t.textTertiary} strokeWidth={1.5} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Annual Goal</h3>
        </div>
        <p style={{ ...t.body, color: t.textTertiary }}>
          Set your annual GCI target on the Goals page to track your pace here.
        </p>
      </div>
    );
  }

  const totalGCI = clients.reduce((s, c) => s + c.commissionEarned, 0);
  const pct = goal.annualTarget > 0 ? Math.min((totalGCI / goal.annualTarget) * 100, 100) : 0;
  const monthsElapsed = new Date().getMonth() + 1;
  const pctOfYear = (monthsElapsed / 12) * 100;
  const onPace = pct >= pctOfYear;

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Target size={16} color={t.textTertiary} strokeWidth={1.5} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Annual Goal</h3>
        </div>
        <span style={{ ...t.caption, color: t.textTertiary }}>
          ${totalGCI.toLocaleString()} / ${goal.annualTarget.toLocaleString()}
        </span>
      </div>
      <div style={{ position: "relative", height: "6px", background: t.tealLight, borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: onPace ? t.success : t.rust,
          borderRadius: "3px", transition: "width 0.3s",
        }} />
        <div style={{
          position: "absolute", top: "-2px", left: `${pctOfYear}%`,
          width: "1px", height: "10px", background: t.text, opacity: 0.2,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
        <span style={{ ...t.caption, color: t.textTertiary }}>{pct.toFixed(0)}% of goal</span>
        <span style={{
          ...t.caption, fontWeight: 600,
          color: onPace ? t.success : t.rust,
        }}>
          {onPace ? "On pace" : "Behind pace"}
        </span>
      </div>
    </div>
  );
}

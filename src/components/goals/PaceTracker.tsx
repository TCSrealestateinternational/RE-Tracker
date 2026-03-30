import { t, card } from "@/styles/theme";
import type { Deal, IncomeGoal } from "@/types";

interface PaceTrackerProps {
  goal: IncomeGoal;
  deals: Deal[];
}

export function PaceTracker({ goal, deals }: PaceTrackerProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const monthsElapsed = currentMonth + 1;
  const monthsLeft = 12 - monthsElapsed;

  const closedDeals = deals.filter((d) => d.stage === "Closed");
  const totalEarned = closedDeals.reduce((s, d) => s + d.projectedCommission, 0);
  const dealsNeeded = goal.avgCommissionPerDeal > 0 ? Math.ceil(goal.annualTarget / goal.avgCommissionPerDeal) : 0;
  const dealsRemaining = Math.max(0, dealsNeeded - closedDeals.length);
  const dealsPerMonthNeeded = monthsLeft > 0 ? Math.ceil(dealsRemaining / monthsLeft) : dealsRemaining;
  const pctOfGoal = goal.annualTarget > 0 ? Math.min((totalEarned / goal.annualTarget) * 100, 100) : 0;
  const pctOfYear = (monthsElapsed / 12) * 100;
  const onPace = pctOfGoal >= pctOfYear;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthDeals = closedDeals.filter((d) => {
      const cd = new Date(d.expectedCloseDate);
      return cd.getMonth() === i && cd.getFullYear() === now.getFullYear();
    });
    return {
      month: new Date(now.getFullYear(), i, 1).toLocaleDateString("en-US", { month: "short" }),
      earned: monthDeals.reduce((s, d) => s + d.projectedCommission, 0),
      target: goal.annualTarget / 12,
    };
  });

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Annual Pace</h3>

      {/* Progress bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ ...t.caption, color: t.textSecondary }}>
            ${totalEarned.toLocaleString()} of ${goal.annualTarget.toLocaleString()}
          </span>
          <span style={{ ...t.caption, fontWeight: 600, color: onPace ? t.success : t.rust }}>
            {onPace ? "On pace" : "Behind pace"}
          </span>
        </div>
        <div style={{ position: "relative", height: "6px", background: t.tealLight, borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pctOfGoal}%`,
            background: onPace ? t.success : t.rust,
            borderRadius: "3px", transition: "width 0.3s",
          }} />
          <div style={{
            position: "absolute", top: "-2px", left: `${pctOfYear}%`,
            width: "1px", height: "10px", background: t.text, opacity: 0.2,
          }} />
        </div>
        <div style={{ ...t.caption, color: t.textTertiary, marginTop: "4px" }}>
          {pctOfGoal.toFixed(0)}% earned &middot; {pctOfYear.toFixed(0)}% of year
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Closed", value: closedDeals.length, color: t.teal },
          { label: "Remaining", value: dealsRemaining, color: t.gold },
          { label: "Needed/Mo", value: dealsPerMonthNeeded, color: t.rust },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: t.bg, padding: "14px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ ...t.stat, fontSize: "20px", color }}>{value}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Monthly bars */}
      <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "10px" }}>Monthly</span>
      <div style={{ display: "grid", gap: "6px" }}>
        {monthlyData.map(({ month, earned, target }) => (
          <div key={month} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "30px", ...t.caption, color: t.textTertiary }}>{month}</span>
            <div style={{ flex: 1, height: "4px", background: t.tealLight, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${target > 0 ? Math.min((earned / target) * 100, 100) : 0}%`,
                background: earned >= target ? t.success : t.gold,
                borderRadius: "2px",
              }} />
            </div>
            <span style={{ width: "55px", textAlign: "right", ...t.caption, color: t.textTertiary }}>
              ${earned.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

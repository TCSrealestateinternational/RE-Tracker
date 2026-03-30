import { theme } from "@/styles/theme";
import type { Deal, IncomeGoal } from "@/types";

interface PaceTrackerProps {
  goal: IncomeGoal;
  deals: Deal[];
}

export function PaceTracker({ goal, deals }: PaceTrackerProps) {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
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

  // Monthly breakdown
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
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>
        Annual Pace Tracker
      </h2>

      {/* Overall progress */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
          <span style={{ color: theme.colors.gray700 }}>
            ${totalEarned.toLocaleString()} of ${goal.annualTarget.toLocaleString()}
          </span>
          <span style={{ fontWeight: 600, color: onPace ? "#10b981" : theme.colors.rust }}>
            {onPace ? "On Pace" : "Behind Pace"}
          </span>
        </div>
        <div style={{ position: "relative", height: "12px", background: theme.colors.gray100, borderRadius: "6px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pctOfGoal}%`,
            background: onPace ? "#10b981" : theme.colors.rust,
            borderRadius: "6px", transition: "width 0.3s",
          }} />
          {/* Year-elapsed marker */}
          <div style={{
            position: "absolute", top: 0, left: `${pctOfYear}%`,
            width: "2px", height: "100%", background: theme.colors.gray900, opacity: 0.4,
          }} />
        </div>
        <div style={{ fontSize: "0.7rem", color: theme.colors.gray500, marginTop: "0.25rem" }}>
          {pctOfGoal.toFixed(0)}% earned &middot; {pctOfYear.toFixed(0)}% of year elapsed
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ background: theme.colors.gray50, padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.colors.teal }}>{closedDeals.length}</div>
          <div style={{ fontSize: "0.7rem", color: theme.colors.gray500 }}>Deals Closed</div>
        </div>
        <div style={{ background: theme.colors.gray50, padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.colors.gold }}>{dealsRemaining}</div>
          <div style={{ fontSize: "0.7rem", color: theme.colors.gray500 }}>Deals Remaining</div>
        </div>
        <div style={{ background: theme.colors.gray50, padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.colors.rust }}>{dealsPerMonthNeeded}</div>
          <div style={{ fontSize: "0.7rem", color: theme.colors.gray500 }}>Needed / Month</div>
        </div>
      </div>

      {/* Monthly bars */}
      <h3 style={{ fontSize: "0.85rem", color: theme.colors.gray700, marginBottom: "0.5rem" }}>Monthly Breakdown</h3>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        {monthlyData.map(({ month, earned, target }) => (
          <div key={month} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "32px", fontSize: "0.75rem", color: theme.colors.gray500 }}>{month}</span>
            <div style={{ flex: 1, height: "8px", background: theme.colors.gray100, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${target > 0 ? Math.min((earned / target) * 100, 100) : 0}%`,
                background: earned >= target ? "#10b981" : theme.colors.gold,
                borderRadius: "4px",
              }} />
            </div>
            <span style={{ fontSize: "0.7rem", color: theme.colors.gray500, width: "50px", textAlign: "right" }}>
              ${earned.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useIncomeGoals } from "@/hooks/useIncomeGoals";
import { useDeals } from "@/hooks/useDeals";
import { IncomeGoalSetup } from "@/components/goals/IncomeGoalSetup";
import { PaceTracker } from "@/components/goals/PaceTracker";
import { t } from "@/styles/theme";

export function GoalsPage() {
  const { goal, saveGoal } = useIncomeGoals();
  const { deals } = useDeals();

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Income Goals</h1>
      <div data-tour="goal-setup" className={goal ? "inline-2col" : ""} style={{ display: "grid", gridTemplateColumns: goal ? "1fr 1fr" : "1fr", gap: "16px", alignItems: "start" }}>
        <IncomeGoalSetup goal={goal} onSave={saveGoal} />
        {goal && <PaceTracker goal={goal} deals={deals} />}
      </div>
    </div>
  );
}

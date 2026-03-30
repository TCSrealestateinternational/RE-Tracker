import { useIncomeGoals } from "@/hooks/useIncomeGoals";
import { useDeals } from "@/hooks/useDeals";
import { IncomeGoalSetup } from "@/components/goals/IncomeGoalSetup";
import { PaceTracker } from "@/components/goals/PaceTracker";

export function GoalsPage() {
  const { goal, saveGoal } = useIncomeGoals();
  const { deals } = useDeals();

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: goal ? "1fr 1fr" : "1fr", gap: "1.25rem", alignItems: "start" }}>
        <IncomeGoalSetup goal={goal} onSave={saveGoal} />
        {goal && <PaceTracker goal={goal} deals={deals} />}
      </div>
    </div>
  );
}

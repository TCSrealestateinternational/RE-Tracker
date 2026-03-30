import { useState, type FormEvent } from "react";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";
import type { IncomeGoal } from "@/types";

interface IncomeGoalSetupProps {
  goal: IncomeGoal | null;
  onSave: (annualTarget: number, avgCommission: number) => void;
}

export function IncomeGoalSetup({ goal, onSave }: IncomeGoalSetupProps) {
  const [annualTarget, setAnnualTarget] = useState(goal?.annualTarget ?? 100000);
  const [avgCommission, setAvgCommission] = useState(goal?.avgCommissionPerDeal ?? 7500);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave(annualTarget, avgCommission);
  }

  const dealsNeeded = avgCommission > 0 ? Math.ceil(annualTarget / avgCommission) : 0;
  const dealsPerMonth = Math.ceil(dealsNeeded / 12);

  return (
    <div style={{ ...card, maxWidth: "480px" }}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Income Goal</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
              Annual GCI Target ($)
            </span>
            <input type="number" value={annualTarget} onChange={(e) => setAnnualTarget(+e.target.value)} style={inputBase} />
          </label>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
              Avg Commission / Deal ($)
            </span>
            <input type="number" value={avgCommission} onChange={(e) => setAvgCommission(+e.target.value)} style={inputBase} />
          </label>
        </div>

        <div style={{
          background: t.bg, borderRadius: "8px", padding: "20px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...t.stat, fontSize: "24px", color: t.teal }}>{dealsNeeded}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "4px" }}>Deals / Year</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...t.stat, fontSize: "24px", color: t.gold }}>{dealsPerMonth}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "4px" }}>Deals / Month</div>
          </div>
        </div>

        <button type="submit" style={btnPrimary}>
          {goal ? "Update Goal" : "Set Goal"}
        </button>
      </form>
    </div>
  );
}

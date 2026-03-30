import { useState, type FormEvent } from "react";
import { theme } from "@/styles/theme";
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

  const inputStyle = {
    width: "100%", padding: "0.5rem", borderRadius: "6px",
    border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem", boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", maxWidth: "480px",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>Income Goal</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>
              Annual GCI Target ($)
            </span>
            <input type="number" value={annualTarget} onChange={(e) => setAnnualTarget(+e.target.value)} style={inputStyle} />
          </label>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>
              Avg Commission / Deal ($)
            </span>
            <input type="number" value={avgCommission} onChange={(e) => setAvgCommission(+e.target.value)} style={inputStyle} />
          </label>
        </div>

        <div style={{
          background: theme.colors.gray50, borderRadius: "8px", padding: "1rem",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.teal }}>{dealsNeeded}</div>
            <div style={{ fontSize: "0.75rem", color: theme.colors.gray500 }}>Deals / Year</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.gold }}>{dealsPerMonth}</div>
            <div style={{ fontSize: "0.75rem", color: theme.colors.gray500 }}>Deals / Month</div>
          </div>
        </div>

        <button type="submit" style={{
          padding: "0.625rem 1.5rem", background: theme.colors.teal, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          {goal ? "Update Goal" : "Set Goal"}
        </button>
      </form>
    </div>
  );
}

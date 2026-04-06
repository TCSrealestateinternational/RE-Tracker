import { Target } from "lucide-react";
import { t, card } from "@/styles/theme";
import type { Client, IncomeGoal } from "@/types";

interface IncomeGoalBarProps {
  goal: IncomeGoal | null;
  clients: Client[];
}

const RING_SIZE = 160;
const STROKE_WIDTH = 10;
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function IncomeGoalBar({ goal, clients }: IncomeGoalBarProps) {
  if (!goal) {
    return (
      <div data-tour="income-goal" style={{ ...card, boxShadow: t.heroShadow }}>
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
  const strokeColor = onPace ? t.success : t.rust;
  const dashOffset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div data-tour="income-goal" style={{
      ...card, boxShadow: t.heroShadow,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", alignSelf: "flex-start" }}>
        <Target size={16} color={t.textTertiary} strokeWidth={1.5} />
        <h3 style={{ ...t.sectionHeader, color: t.text }}>Annual Goal</h3>
      </div>

      <div style={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          {/* Track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={t.tealLight}
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ ...t.stat, fontSize: "20px", color: t.text }}>
            ${totalGCI.toLocaleString()}
          </span>
          <span style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
            of ${goal.annualTarget.toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{
        marginTop: "16px",
        padding: "4px 14px",
        borderRadius: "20px",
        background: onPace ? t.successLight : t.rustLight,
        display: "inline-flex", alignItems: "center", gap: "6px",
      }}>
        <span style={{ ...t.caption, fontWeight: 600, color: strokeColor }}>
          {pct.toFixed(0)}% of goal — {onPace ? "On pace" : "Behind pace"}
        </span>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { useDailyCheckIns } from "@/hooks/useDailyCheckIns";
import { useIncomeGoals } from "@/hooks/useIncomeGoals";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { WeeklyHours } from "@/components/dashboard/WeeklyHours";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RevenueStats } from "@/components/dashboard/RevenueStats";
import { FollowUpAlerts } from "@/components/dashboard/FollowUpAlerts";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { IncomeGoalBar } from "@/components/dashboard/IncomeGoalBar";
import { DailyCheckInWidget } from "@/components/checkin/DailyCheckInWidget";
import { getWeekStart } from "@/utils/dates";
import { t, card } from "@/styles/theme";

export function DashboardPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const { deals } = useDeals();
  const { todayCheckIn, getStreak, submitCheckIn } = useDailyCheckIns();
  const { goal } = useIncomeGoals();
  const { canInstall, install, dismiss } = useInstallPrompt();
  const navigate = useNavigate();
  const weekStart = useMemo(() => getWeekStart(), []);

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Dashboard</h1>

      {canInstall && (
        <div style={{
          ...card,
          background: t.tealLight,
          border: `1px solid rgba(12, 65, 78, 0.15)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "14px 20px",
        }}>
          <span style={{ ...t.body, color: t.text }}>
            Install RE Tracker to your desktop for quick access.
          </span>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button onClick={install} style={{
              padding: "8px 16px", background: t.teal, color: t.textInverse,
              border: "none", borderRadius: "8px", fontSize: "13px",
              fontWeight: 600, fontFamily: t.font, cursor: "pointer",
            }}>
              Install App
            </button>
            <button onClick={dismiss} style={{
              padding: "8px 12px", background: "transparent", color: t.textTertiary,
              border: "none", fontSize: "13px", fontFamily: t.font, cursor: "pointer",
            }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <RevenueStats clients={clients} entries={entries} />

      <div className="grid-2col">
        <DailyCheckInWidget todayCheckIn={todayCheckIn} streak={getStreak()} onSubmit={submitCheckIn} />
        <IncomeGoalBar goal={goal} clients={clients} />
      </div>

      <div className="grid-3col">
        <FollowUpAlerts clients={clients} onClientClick={navigate} />
        <PipelineSummary deals={deals} />
        <GoalProgress entries={entries} weekStart={weekStart} goals={{}} />
      </div>

      <WeeklyHours entries={entries} weekStart={weekStart} />
    </div>
  );
}

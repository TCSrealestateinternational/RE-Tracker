import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { useDailyCheckIns } from "@/hooks/useDailyCheckIns";
import { useIncomeGoals } from "@/hooks/useIncomeGoals";
import { WeeklyHours } from "@/components/dashboard/WeeklyHours";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RevenueStats } from "@/components/dashboard/RevenueStats";
import { FollowUpAlerts } from "@/components/dashboard/FollowUpAlerts";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { IncomeGoalBar } from "@/components/dashboard/IncomeGoalBar";
import { DailyCheckInWidget } from "@/components/checkin/DailyCheckInWidget";
import { getWeekStart } from "@/utils/dates";
import { t } from "@/styles/theme";

export function DashboardPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const { deals } = useDeals();
  const { todayCheckIn, getStreak, submitCheckIn } = useDailyCheckIns();
  const { goal } = useIncomeGoals();
  const navigate = useNavigate();
  const weekStart = useMemo(() => getWeekStart(), []);

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Dashboard</h1>

      <RevenueStats clients={clients} entries={entries} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <DailyCheckInWidget todayCheckIn={todayCheckIn} streak={getStreak()} onSubmit={submitCheckIn} />
        <IncomeGoalBar goal={goal} clients={clients} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <FollowUpAlerts clients={clients} onClientClick={navigate} />
        <PipelineSummary deals={deals} />
        <GoalProgress entries={entries} weekStart={weekStart} goals={{}} />
      </div>

      <WeeklyHours entries={entries} weekStart={weekStart} />
    </div>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { useDailyCheckIns } from "@/hooks/useDailyCheckIns";
import { useIncomeGoals } from "@/hooks/useIncomeGoals";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useAuth } from "@/context/AuthContext";
import { WeeklyHours } from "@/components/dashboard/WeeklyHours";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RevenueStats } from "@/components/dashboard/RevenueStats";
import { FollowUpAlerts } from "@/components/dashboard/FollowUpAlerts";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { IncomeGoalBar } from "@/components/dashboard/IncomeGoalBar";
import { CloseDateAlerts } from "@/components/dashboard/CloseDateAlerts";
import { DailyCheckInWidget } from "@/components/checkin/DailyCheckInWidget";
import { getWeekStart, todayStr } from "@/utils/dates";
import { t, card } from "@/styles/theme";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const { deals, moveDeal, updateDeal } = useDeals();
  const { checkIns, todayCheckIn, getStreak, submitCheckIn } = useDailyCheckIns();
  const { goal } = useIncomeGoals();
  const { canInstall, install, dismiss } = useInstallPrompt();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const weekStart = useMemo(() => getWeekStart(), []);

  const today = todayStr();
  const followUpsDue = clients.filter((c) => c.followUpDate && c.followUpDate <= today).length;
  const activeClients = clients.length;
  const todayMs = entries
    .filter((e) => new Date(e.startTime).toISOString().slice(0, 10) === today)
    .reduce((s, e) => s + e.durationMs, 0);
  const todayHours = (todayMs / 3_600_000).toFixed(1);

  const firstName = profile?.displayName?.split(" ")[0] || "there";

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      {/* Welcome section */}
      <div>
        <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "4px" }}>
          {getGreeting()}, {firstName}
        </h1>
        <p style={{ ...t.body, color: t.textTertiary }}>
          {activeClients} active clients · {followUpsDue} follow-up{followUpsDue !== 1 ? "s" : ""} due · {todayHours}h logged today
        </p>
      </div>

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

      <CloseDateAlerts deals={deals} onMoveDeal={moveDeal} onUpdateDeal={updateDeal} />

      {/* Bento grid */}
      <div className="bento-grid">
        {/* Row 1: Revenue stats + GCI ring */}
        <div className="bento-8">
          <RevenueStats deals={deals} entries={entries} />
        </div>
        <div className="bento-4">
          <IncomeGoalBar goal={goal} clients={clients} />
        </div>

        {/* Row 2: Pipeline + Follow-ups | Check-in */}
        <div className="bento-7" style={{ display: "grid", gap: "20px" }}>
          <PipelineSummary deals={deals} />
          <FollowUpAlerts clients={clients} onClientClick={navigate} />
        </div>
        <div className="bento-5">
          <DailyCheckInWidget
            todayCheckIn={todayCheckIn}
            streak={getStreak()}
            onSubmit={submitCheckIn}
            checkIns={checkIns}
          />
        </div>

        {/* Row 3: Full-width cards */}
        <div className="bento-full">
          <WeeklyHours entries={entries} weekStart={weekStart} />
        </div>
        <div className="bento-full">
          <GoalProgress entries={entries} weekStart={weekStart} goals={{}} />
        </div>
      </div>
    </div>
  );
}

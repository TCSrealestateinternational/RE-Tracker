import { useMemo } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { WeeklyHours } from "@/components/dashboard/WeeklyHours";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { RevenueStats } from "@/components/dashboard/RevenueStats";

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(now.getFullYear(), now.getMonth(), diff);
  mon.setHours(0, 0, 0, 0);
  return mon.getTime();
}

export function DashboardPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const weekStart = useMemo(getWeekStart, []);

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <RevenueStats clients={clients} entries={entries} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <WeeklyHours entries={entries} weekStart={weekStart} />
        <GoalProgress entries={entries} weekStart={weekStart} goals={{}} />
      </div>
    </div>
  );
}

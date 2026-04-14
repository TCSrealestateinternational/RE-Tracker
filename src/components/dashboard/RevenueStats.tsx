import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import type { Deal, TimeEntry } from "@/types";

interface RevenueStatsProps {
  deals: Deal[];
  entries: TimeEntry[];
}

export function RevenueStats({ deals, entries }: RevenueStatsProps) {
  const closedGCI = deals
    .filter((d) => d.stage === "Closed")
    .reduce((s, d) => s + (d.actualCommission ?? d.projectedCommission), 0);
  const prospectiveGCI = deals
    .filter((d) => d.stage === "Under Contract")
    .reduce((s, d) => s + d.projectedCommission, 0);
  const totalMs = entries.reduce((s, e) => s + e.durationMs, 0);
  const totalHours = totalMs / 3_600_000;
  const revenuePerHour = totalHours > 0 ? closedGCI / totalHours : 0;

  return (
    <div data-tour="revenue-stats" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      <div className="hover-lift stat-card" style={{
        ...card, flex: 1, minWidth: "160px", padding: "32px",
        display: "flex", alignItems: "center", gap: "16px",
        borderLeft: `3px solid ${t.teal}`,
      }}>
        <Icon name="schedule" size={22} color={t.teal} />
        <div>
          <div style={{ ...t.stat, color: t.teal, fontSize: "28px" }}>{totalHours.toFixed(1)}h</div>
          <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Total Hours</div>
        </div>
      </div>

      <div className="hover-lift stat-card" style={{
        ...card, flex: 1, minWidth: "160px", padding: "32px",
        display: "flex", alignItems: "center", gap: "16px",
        borderLeft: `3px solid ${t.gold}`,
      }}>
        <Icon name="payments" size={22} color={t.gold} />
        <div>
          <div className="stat-pair" style={{ display: "flex", gap: "20px", alignItems: "baseline" }}>
            <div>
              <div style={{ ...t.stat, color: t.success, fontSize: "28px" }}>${closedGCI.toLocaleString()}</div>
              <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Closed GCI</div>
            </div>
            <div>
              <div style={{ ...t.stat, color: t.gold, fontSize: "20px" }}>${prospectiveGCI.toLocaleString()}</div>
              <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Prospective</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hover-lift stat-card" style={{
        ...card, flex: 1, minWidth: "160px", padding: "32px",
        display: "flex", alignItems: "center", gap: "16px",
        borderLeft: `3px solid ${t.teal}`,
      }}>
        <Icon name="trending_up" size={22} color={t.teal} />
        <div>
          <div style={{ ...t.stat, color: t.teal, fontSize: "28px" }}>${revenuePerHour.toFixed(0)}</div>
          <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Revenue / Hour</div>
        </div>
      </div>
    </div>
  );
}

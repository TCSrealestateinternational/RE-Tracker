import { DollarSign, Clock, TrendingUp } from "lucide-react";
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
    <div className="grid-3col" data-tour="revenue-stats">
      <div style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
        <Clock size={16} color={t.teal} strokeWidth={1.5} />
        <div>
          <div style={{ ...t.stat, color: t.teal, fontSize: "24px" }}>{totalHours.toFixed(1)}h</div>
          <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Total Hours</div>
        </div>
      </div>

      <div style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
        <DollarSign size={16} color={t.gold} strokeWidth={1.5} />
        <div style={{ display: "flex", gap: "20px", alignItems: "baseline" }}>
          <div>
            <div style={{ ...t.stat, color: t.gold, fontSize: "24px" }}>${prospectiveGCI.toLocaleString()}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Prospective GCI</div>
          </div>
          <div>
            <div style={{ ...t.stat, color: t.success, fontSize: "24px" }}>${closedGCI.toLocaleString()}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Closed GCI</div>
          </div>
        </div>
      </div>

      <div style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
        <TrendingUp size={16} color={t.teal} strokeWidth={1.5} />
        <div>
          <div style={{ ...t.stat, color: t.teal, fontSize: "24px" }}>${revenuePerHour.toFixed(0)}</div>
          <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Revenue / Hour</div>
        </div>
      </div>
    </div>
  );
}

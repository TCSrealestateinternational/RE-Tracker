import { DEAL_STAGES, type Deal } from "@/types";
import { theme } from "@/styles/theme";

interface PipelineSummaryProps {
  deals: Deal[];
}

const STAGE_COLORS: Record<string, string> = {
  "New Lead": theme.colors.teal,
  "Active": theme.colors.gold,
  "Under Contract": "#6366f1",
  "Closed": "#10b981",
  "Lost": theme.colors.rust,
};

export function PipelineSummary({ deals }: PipelineSummaryProps) {
  const activePipeline = deals.filter((d) => d.stage !== "Closed" && d.stage !== "Lost");
  const totalPipeline = activePipeline.reduce((s, d) => s + d.projectedCommission, 0);

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal }}>Deal Pipeline</h3>
        <span style={{ fontSize: "1rem", fontWeight: 700, color: theme.colors.gold }}>
          ${totalPipeline.toLocaleString()}
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {DEAL_STAGES.filter((s) => s !== "Lost").map((stage) => {
          const count = deals.filter((d) => d.stage === stage).length;
          return (
            <div key={stage} style={{
              flex: 1, textAlign: "center", padding: "0.5rem",
              background: theme.colors.gray50, borderRadius: "8px",
            }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: STAGE_COLORS[stage] }}>{count}</div>
              <div style={{ fontSize: "0.65rem", color: theme.colors.gray500 }}>{stage}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

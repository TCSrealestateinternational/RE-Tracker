import { Kanban } from "lucide-react";
import { DEAL_STAGES, type Deal, type DealStage } from "@/types";
import { t, card } from "@/styles/theme";

interface PipelineSummaryProps {
  deals: Deal[];
}

const STAGE_COLORS: Record<DealStage, string> = {
  "New Lead": t.teal,
  "Active": t.gold,
  "Under Contract": "#7c6ca8",
  "Closed": t.success,
  "Lost": t.rust,
};

export function PipelineSummary({ deals }: PipelineSummaryProps) {
  const activePipeline = deals.filter((d) => d.stage !== "Closed" && d.stage !== "Lost");
  const totalPipeline = activePipeline.reduce((s, d) => s + d.projectedCommission, 0);

  return (
    <div data-tour="pipeline-summary" style={{ ...card, boxShadow: t.heroShadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Kanban size={16} color={t.textTertiary} strokeWidth={1.5} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Pipeline</h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...t.stat, fontSize: "22px", color: t.gold }}>${totalPipeline.toLocaleString()}</div>
          <div style={{ ...t.caption, color: t.textTertiary }}>{activePipeline.length} active deals</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {DEAL_STAGES.filter((s) => s !== "Lost").map((stage) => {
          const count = deals.filter((d) => d.stage === stage).length;
          return (
            <div key={stage} className="hover-slide" style={{
              flex: 1, textAlign: "center", padding: "14px 8px",
              background: t.bg, borderRadius: "8px",
            }}>
              <div style={{ ...t.stat, fontSize: "28px", color: STAGE_COLORS[stage] }}>{count}</div>
              <div style={{ ...t.label, color: t.textTertiary, marginTop: "4px", fontSize: "10px" }}>{stage}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

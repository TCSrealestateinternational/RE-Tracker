import { DEAL_STAGES, type Deal, type DealStage } from "@/types";
import { DealCard } from "./DealCard";
import { theme } from "@/styles/theme";

const STAGE_COLORS: Record<DealStage, string> = {
  "New Lead": theme.colors.teal,
  "Active": theme.colors.gold,
  "Under Contract": "#6366f1",
  "Closed": "#10b981",
  "Lost": theme.colors.rust,
};

interface KanbanBoardProps {
  deals: Deal[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
}

export function KanbanBoard({ deals, onMove, onEdit }: KanbanBoardProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${DEAL_STAGES.length}, 1fr)`,
      gap: "0.75rem",
      minHeight: "400px",
    }}>
      {DEAL_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const total = stageDeals.reduce((s, d) => s + d.projectedCommission, 0);
        return (
          <div key={stage} style={{
            background: theme.colors.gray50,
            borderRadius: "10px",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "0.75rem", paddingBottom: "0.5rem",
              borderBottom: `2px solid ${STAGE_COLORS[stage]}`,
            }}>
              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: theme.colors.gray900 }}>
                {stage}
              </span>
              <span style={{
                fontSize: "0.7rem", fontWeight: 600,
                background: STAGE_COLORS[stage], color: "white",
                padding: "0.15rem 0.5rem", borderRadius: "10px",
              }}>
                {stageDeals.length}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {stageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} stages={DEAL_STAGES} onMove={onMove} onEdit={onEdit} />
              ))}
            </div>

            <div style={{
              marginTop: "0.5rem", paddingTop: "0.5rem",
              borderTop: `1px solid ${theme.colors.gray200}`,
              fontSize: "0.75rem", color: theme.colors.gray500, textAlign: "center",
            }}>
              Pipeline: <strong style={{ color: STAGE_COLORS[stage] }}>${total.toLocaleString()}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

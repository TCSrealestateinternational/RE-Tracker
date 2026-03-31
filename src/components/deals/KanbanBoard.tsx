import { DEAL_STAGES, type Deal, type DealStage } from "@/types";
import { DealCard } from "./DealCard";
import { t } from "@/styles/theme";

interface KanbanBoardProps {
  deals: Deal[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
  onDelete?: (id: string) => void;
}

export function KanbanBoard({ deals, onMove, onEdit, onDelete }: KanbanBoardProps) {
  return (
    <div className="kanban-scroll">
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${DEAL_STAGES.length}, 1fr)`,
      gap: "12px",
      minHeight: "400px",
    }}>
      {DEAL_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const total = stageDeals.reduce((s, d) => s + d.projectedCommission, 0);
        return (
          <div key={stage} style={{
            background: t.bg,
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "14px",
            }}>
              <span style={{ ...t.label, color: t.textSecondary }}>{stage}</span>
              <span style={{
                ...t.caption, fontWeight: 600,
                color: t.textTertiary,
                background: t.surface,
                padding: "2px 8px", borderRadius: "10px",
              }}>
                {stageDeals.length}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {stageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} stages={DEAL_STAGES} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
              ))}
              {stageDeals.length === 0 && (
                <p style={{ ...t.caption, color: t.textTertiary, textAlign: "center", padding: "24px 0" }}>
                  No deals
                </p>
              )}
            </div>

            <div style={{
              marginTop: "10px", paddingTop: "10px",
              borderTop: `1px solid ${t.border}`,
              ...t.caption, color: t.textTertiary, textAlign: "center",
            }}>
              {stage === "Closed" ? (
                <>
                  <div style={{ color: t.success, fontWeight: 600 }}>
                    Actual: ${stageDeals.reduce((s, d) => s + (d.actualCommission ?? d.projectedCommission ?? 0), 0).toLocaleString()}
                  </div>
                  <div>Projected: ${total.toLocaleString()}</div>
                </>
              ) : (
                <>Projected: ${total.toLocaleString()}</>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

import { theme } from "@/styles/theme";
import type { Deal, DealStage } from "@/types";

interface DealCardProps {
  deal: Deal;
  stages: readonly DealStage[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
}

export function DealCard({ deal, stages, onMove, onEdit }: DealCardProps) {
  return (
    <div
      style={{
        background: theme.colors.white,
        border: `1px solid ${theme.colors.gray200}`,
        borderRadius: "8px",
        padding: "0.75rem",
        marginBottom: "0.5rem",
        cursor: "pointer",
      }}
      onClick={() => onEdit(deal)}
    >
      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: theme.colors.gray900, marginBottom: "0.25rem" }}>
        {deal.clientName}
      </div>
      <div style={{ fontSize: "0.8rem", color: theme.colors.gold, fontWeight: 600, marginBottom: "0.25rem" }}>
        ${deal.projectedCommission.toLocaleString()}
      </div>
      <div style={{ fontSize: "0.75rem", color: theme.colors.gray500, marginBottom: "0.5rem" }}>
        Close: {deal.expectedCloseDate}
      </div>
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
        {stages.filter((s) => s !== deal.stage).map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onMove(deal.id, s); }}
            style={{
              padding: "0.15rem 0.4rem",
              fontSize: "0.65rem",
              background: s === "Closed" ? "#dcfce7" : s === "Lost" ? "#fee2e2" : theme.colors.gray100,
              color: s === "Closed" ? "#166534" : s === "Lost" ? theme.colors.rust : theme.colors.gray700,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

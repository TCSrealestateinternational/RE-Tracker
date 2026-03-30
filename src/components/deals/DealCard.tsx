import { t } from "@/styles/theme";
import type { Deal, DealStage } from "@/types";

interface DealCardProps {
  deal: Deal;
  stages: readonly DealStage[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
}

export function DealCard({ deal, stages, onMove, onEdit }: DealCardProps) {
  const projected = deal.projectedCommission ?? 0;
  const isClosed = deal.stage === "Closed";
  const actual = deal.actualCommission;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "8px",
        cursor: "pointer",
        transition: "background 0.12s",
      }}
      onClick={() => onEdit(deal)}
      onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
    >
      <div style={{ fontWeight: 600, fontSize: "14px", color: t.text, marginBottom: "4px" }}>
        {deal.clientName}
      </div>
      <div style={{ fontSize: "13px", color: t.gold, fontWeight: 600, marginBottom: "2px" }}>
        Projected: ${projected.toLocaleString()}
      </div>
      {isClosed && actual != null && (
        <div style={{ fontSize: "13px", color: t.success, fontWeight: 600, marginBottom: "2px" }}>
          Actual: ${actual.toLocaleString()}
        </div>
      )}
      <div style={{ ...t.caption, color: t.textTertiary, marginBottom: deal.actualCloseDate ? "2px" : "10px" }}>
        Close: {deal.expectedCloseDate || "TBD"}
      </div>
      {deal.actualCloseDate && (
        <div style={{ ...t.caption, color: t.success, fontWeight: 500, marginBottom: "10px" }}>
          Closed: {deal.actualCloseDate}
        </div>
      )}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {stages.filter((s) => s !== deal.stage).map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onMove(deal.id, s); }}
            style={{
              padding: "3px 8px",
              fontSize: "11px",
              fontWeight: 500,
              fontFamily: t.font,
              background: s === "Closed" ? t.successLight : s === "Lost" ? t.rustLight : t.bg,
              color: s === "Closed" ? t.success : s === "Lost" ? t.rust : t.textSecondary,
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

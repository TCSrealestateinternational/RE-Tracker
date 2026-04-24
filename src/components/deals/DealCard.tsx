import { Icon } from "@/components/shared/Icon";
import { t } from "@/styles/theme";
import type { Deal, DealStage, TimeEntry } from "@/types";

interface DealCardProps {
  deal: Deal;
  stages: readonly DealStage[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
  onDelete?: (id: string) => void;
  timeEntries?: TimeEntry[];
}

export function DealCard({ deal, stages, onMove, onEdit, onDelete, timeEntries }: DealCardProps) {
  const projected = deal.projectedCommission ?? 0;
  const isClosed = deal.stage === "Closed";
  const actual = deal.actualCommission;

  // Per-client hours + $/hr for closed deals
  const clientEntries = timeEntries?.filter((e) => e.clientId === deal.clientId) ?? [];
  const totalMs = clientEntries.reduce((sum, e) => sum + e.durationMs, 0);
  const totalHours = totalMs / 3_600_000;
  const commission = actual ?? projected;
  const dollarPerHour = totalHours > 0 ? commission / totalHours : 0;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "8px",
        cursor: "pointer",
        transition: "background 0.12s, transform 0.15s, box-shadow 0.15s",
      }}
      onClick={() => onEdit(deal)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = t.surfaceHover;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = t.surface;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "14px", color: t.text, marginBottom: "4px" }}>
        {deal.clientName}
      </div>
      {isClosed ? (
        <>
          <div style={{
            fontFamily: t.fontHeadline, fontStyle: "italic",
            fontSize: "16px", color: t.success, fontWeight: 400, marginBottom: "2px",
          }}>
            Actual: ${(actual ?? projected).toLocaleString()}
          </div>
          <div style={{ ...t.caption, color: t.textTertiary }}>
            Projected: ${projected.toLocaleString()}
          </div>
          {totalHours > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginTop: "6px", padding: "6px 8px",
              background: "rgba(79, 108, 75, 0.06)", borderRadius: "6px",
            }}>
              <Icon name="schedule" size={12} color={t.teal} />
              <span style={{ ...t.caption, color: t.textSecondary, fontWeight: 500 }}>
                {totalHours.toFixed(1)} hrs
              </span>
              <span style={{ ...t.caption, color: t.textTertiary }}>|</span>
              <Icon name="trending_up" size={12} color={t.teal} />
              <span style={{ ...t.caption, color: t.teal, fontWeight: 600 }}>
                ${dollarPerHour.toFixed(0)}/hr
              </span>
            </div>
          )}
        </>
      ) : (
        <div style={{
          fontFamily: t.fontHeadline, fontStyle: "italic",
          fontSize: "16px", color: t.gold, fontWeight: 400, marginBottom: "2px",
        }}>
          Projected: ${projected.toLocaleString()}
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
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
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
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
            title="Delete deal"
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", color: t.textTertiary, padding: "3px",
              borderRadius: "4px", display: "inline-flex", alignItems: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(ev) => { ev.currentTarget.style.color = t.rust; }}
            onMouseLeave={(ev) => { ev.currentTarget.style.color = t.textTertiary; }}
          >
            <Icon name="delete" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

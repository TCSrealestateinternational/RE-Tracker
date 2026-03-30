import { AlertTriangle } from "lucide-react";
import { t, card, btnPrimary } from "@/styles/theme";
import type { Deal, DealStage } from "@/types";

interface CloseDateAlertsProps {
  deals: Deal[];
  onMoveDeal: (id: string, stage: DealStage) => void;
  onUpdateDeal: (id: string, data: Partial<Deal>) => void;
}

export function CloseDateAlerts({ deals, onMoveDeal, onUpdateDeal }: CloseDateAlertsProps) {
  const today = new Date().toISOString().slice(0, 10);

  const overdue = deals.filter(
    (d) =>
      d.expectedCloseDate &&
      d.expectedCloseDate <= today &&
      d.stage !== "Closed" &&
      d.stage !== "Lost"
  );

  if (overdue.length === 0) return null;

  function handleExtend(deal: Deal) {
    const next = new Date();
    next.setDate(next.getDate() + 14);
    onUpdateDeal(deal.id, { expectedCloseDate: next.toISOString().slice(0, 10) });
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <AlertTriangle size={16} color={t.rust} strokeWidth={2} />
        <h3 style={{ ...t.sectionHeader, color: t.rust }}>Close Date Alerts</h3>
      </div>
      {overdue.map((deal) => (
        <div key={deal.id} style={{
          ...card,
          background: t.rustLight,
          border: `1px solid rgba(157, 68, 42, 0.15)`,
          padding: "16px",
        }}>
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: t.text, marginBottom: "2px" }}>
              {deal.clientName}
            </div>
            <div style={{ ...t.caption, color: t.textSecondary }}>
              Expected close: {deal.expectedCloseDate} — Did this deal close?
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                onUpdateDeal(deal.id, {
                  actualCloseDate: today,
                  actualCommission: deal.projectedCommission ?? 0,
                });
                onMoveDeal(deal.id, "Closed");
              }}
              style={{ ...btnPrimary, padding: "6px 14px", fontSize: "12px", background: t.success }}
            >
              Mark Closed
            </button>
            <button
              onClick={() => handleExtend(deal)}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 600, fontFamily: t.font,
                background: "transparent", border: `1px solid ${t.borderMedium}`,
                borderRadius: "8px", cursor: "pointer", color: t.textSecondary,
              }}
            >
              Extend 2 Weeks
            </button>
            <button
              onClick={() => onMoveDeal(deal.id, "Lost")}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 600, fontFamily: t.font,
                background: "transparent", border: `1px solid ${t.borderMedium}`,
                borderRadius: "8px", cursor: "pointer", color: t.rust,
              }}
            >
              Mark Lost
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

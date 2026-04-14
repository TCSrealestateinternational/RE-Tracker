import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { DEAL_STAGES, type Deal, type DealStage } from "@/types";
import { DealCard } from "./DealCard";
import { t } from "@/styles/theme";

interface AccordionPipelineProps {
  deals: Deal[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
  onDelete?: (id: string) => void;
}

export function AccordionPipeline({ deals, onMove, onEdit, onDelete }: AccordionPipelineProps) {
  const [openStages, setOpenStages] = useState<Set<DealStage>>(new Set(["New Lead", "Active", "Under Contract"]));

  function toggleStage(stage: DealStage) {
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage); else next.add(stage);
      return next;
    });
  }

  const activePipeline = deals.filter((d) => d.stage !== "Closed" && d.stage !== "Lost");
  const totalPipeline = activePipeline.reduce((s, d) => s + d.projectedCommission, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {DEAL_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const total = stageDeals.reduce((s, d) => s + d.projectedCommission, 0);
        const isOpen = openStages.has(stage);

        return (
          <div key={stage} style={{
            background: t.bg, borderRadius: "12px", overflow: "hidden",
          }}>
            <button
              type="button"
              onClick={() => toggleStage(stage)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
                fontFamily: t.font,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ ...t.microLabel, color: t.textSecondary }}>{stage}</span>
                <span style={{
                  ...t.caption, fontWeight: 600, color: t.textTertiary,
                  background: t.surface, padding: "2px 10px", borderRadius: "20px",
                }}>
                  {stageDeals.length}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontFamily: t.fontHeadline, fontStyle: "italic",
                  fontSize: "16px", color: t.gold, fontWeight: 400,
                }}>
                  ${total.toLocaleString()}
                </span>
                <Icon
                  name="expand_more"
                  size={20}
                  color={t.textTertiary}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
            </button>

            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                {stageDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} stages={DEAL_STAGES} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
                ))}
                {stageDeals.length === 0 && (
                  <p style={{ ...t.caption, color: t.textTertiary, textAlign: "center", padding: "24px 0" }}>
                    No deals
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Aggregate summary */}
      <div style={{
        background: t.teal, borderRadius: "12px", padding: "24px",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...t.stat, fontSize: "28px", color: t.textInverse }}>
            {activePipeline.length}
          </div>
          <div style={{ ...t.microLabel, color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Active Deals</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...t.stat, fontSize: "28px", color: t.textInverse }}>
            ${totalPipeline.toLocaleString()}
          </div>
          <div style={{ ...t.microLabel, color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Pipeline Volume</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...t.stat, fontSize: "28px", color: t.textInverse }}>
            {deals.filter((d) => d.stage === "Closed").length}
          </div>
          <div style={{ ...t.microLabel, color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Closed</div>
        </div>
      </div>
    </div>
  );
}

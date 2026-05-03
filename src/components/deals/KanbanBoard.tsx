import { useState, useEffect } from "react";
import { Icon } from "@/components/shared/Icon";
import { DEAL_STAGES, type Deal, type DealStage, type TimeEntry } from "@/types";
import { DealCard } from "./DealCard";
import { t } from "@/styles/theme";

interface KanbanBoardProps {
  deals: Deal[];
  onMove: (id: string, stage: DealStage) => void;
  onEdit: (deal: Deal) => void;
  onDelete?: (id: string) => void;
  onRelease?: (deal: Deal) => void;
  timeEntries?: TimeEntry[];
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

function StageFooter({ stage, stageDeals, total }: { stage: string; stageDeals: Deal[]; total: number }) {
  return (
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
  );
}

export function KanbanBoard({ deals, onMove, onEdit, onDelete, onRelease, timeEntries }: KanbanBoardProps) {
  const isMobile = useIsMobile();
  const [openStage, setOpenStage] = useState<DealStage | null>(null);

  useEffect(() => {
    if (isMobile && openStage === null) {
      const first = DEAL_STAGES.find((s) => deals.some((d) => d.stage === s));
      if (first) setOpenStage(first);
    }
  }, [isMobile, deals, openStage]);

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + d.projectedCommission, 0);
          const isOpen = openStage === stage;

          return (
            <div key={stage} style={{ background: t.bg, borderRadius: "12px", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setOpenStage(isOpen ? null : stage)}
                aria-expanded={isOpen}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
                  fontFamily: t.font,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ ...t.microLabel, color: t.textSecondary }}>{stage}</span>
                  <span style={{
                    ...t.caption, fontWeight: 600, color: t.textTertiary,
                    background: t.surface, padding: "2px 8px", borderRadius: "10px",
                  }}>
                    {stageDeals.length}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ ...t.caption, color: t.gold, fontWeight: 600 }}>
                    ${total.toLocaleString()}
                  </span>
                  <Icon
                    name="expand_more"
                    size={18}
                    color={t.textTertiary}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: "0 14px 14px" }}>
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} stages={DEAL_STAGES} onMove={onMove} onEdit={onEdit} onDelete={onDelete} onRelease={onRelease} timeEntries={timeEntries} />
                  ))}
                  {stageDeals.length === 0 && (
                    <p style={{ ...t.caption, color: t.textTertiary, textAlign: "center", padding: "24px 0" }}>
                      No deals
                    </p>
                  )}
                  <StageFooter stage={stage} stageDeals={stageDeals} total={total} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

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
            borderRadius: "12px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "14px",
            }}>
              <span style={{ ...t.microLabel, color: t.textSecondary }}>{stage}</span>
              <span style={{
                ...t.caption, fontWeight: 600,
                color: t.textTertiary,
                background: t.surface,
                padding: "2px 8px", borderRadius: "20px",
              }}>
                {stageDeals.length}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {stageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} stages={DEAL_STAGES} onMove={onMove} onEdit={onEdit} onDelete={onDelete} onRelease={onRelease} timeEntries={timeEntries} />
              ))}
              {stageDeals.length === 0 && (
                <p style={{ ...t.caption, color: t.textTertiary, textAlign: "center", padding: "24px 0" }}>
                  No deals
                </p>
              )}
            </div>

            <StageFooter stage={stage} stageDeals={stageDeals} total={total} />
          </div>
        );
      })}
    </div>
    </div>
  );
}

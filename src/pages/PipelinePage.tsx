import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useTransactionSync } from "@/hooks/useTransactionSync";
import { KanbanBoard } from "@/components/deals/KanbanBoard";
import { AccordionPipeline } from "@/components/deals/AccordionPipeline";
import { DealForm } from "@/components/deals/DealForm";
import { t, btnPrimary } from "@/styles/theme";
import type { Deal } from "@/types";

type PipelineView = "kanban" | "list";

export function PipelinePage() {
  const { deals, addDeal, updateDeal, moveDeal, removeDeal } = useDeals();
  const { clients } = useClients();
  const { entries } = useTimeEntries();
  const { syncDealToTransaction } = useTransactionSync();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [view, setView] = useState<PipelineView>("kanban");

  if (showForm || editing) {
    return (
      <DealForm
        clients={clients}
        initial={editing ?? undefined}
        onSubmit={async (data) => {
          if (editing) {
            await updateDeal(editing.id, data);
            if (editing.transactionId) {
              const client = clients.find((c) => c.id === data.clientId);
              if (client) {
                await syncDealToTransaction({ ...editing, ...data } as Deal, client);
              }
            }
          } else {
            await addDeal(data);
          }
          setShowForm(false);
          setEditing(null);
        }}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <div>
        <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
          DEAL FLOW
        </span>
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ ...t.pageTitle, color: t.text }}>Deal Pipeline</h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* View toggle */}
            <div style={{
              display: "flex", borderRadius: "20px", overflow: "hidden",
              border: `1px solid ${t.borderMedium}`,
            }}>
              {(["kanban", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 14px", fontSize: "12px", fontWeight: 600,
                    fontFamily: t.font, border: "none", cursor: "pointer",
                    background: view === v ? t.teal : "transparent",
                    color: view === v ? t.textInverse : t.textSecondary,
                    display: "flex", alignItems: "center", gap: "4px",
                    transition: "background 0.12s, color 0.12s",
                  }}
                >
                  <Icon name={v === "kanban" ? "view_kanban" : "list"} size={14} />
                  {v === "kanban" ? "Kanban" : "List"}
                </button>
              ))}
            </div>
            <button data-tour="add-deal" onClick={() => setShowForm(true)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="add" size={16} />
              Add Deal
            </button>
          </div>
        </div>
      </div>
      <div data-tour="kanban-board">
        {view === "kanban" ? (
          <KanbanBoard deals={deals} onMove={moveDeal} onEdit={setEditing} onDelete={removeDeal} timeEntries={entries} />
        ) : (
          <AccordionPipeline deals={deals} onMove={moveDeal} onEdit={setEditing} onDelete={removeDeal} timeEntries={entries} />
        )}
      </div>
    </div>
  );
}

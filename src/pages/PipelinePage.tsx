import { useState } from "react";
import { Plus } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { useTransactionSync } from "@/hooks/useTransactionSync";
import { KanbanBoard } from "@/components/deals/KanbanBoard";
import { DealForm } from "@/components/deals/DealForm";
import { t, btnPrimary } from "@/styles/theme";
import type { Deal } from "@/types";

export function PipelinePage() {
  const { deals, addDeal, updateDeal, moveDeal, removeDeal } = useDeals();
  const { clients } = useClients();
  const { syncDealToTransaction } = useTransactionSync();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);

  if (showForm || editing) {
    return (
      <DealForm
        clients={clients}
        initial={editing ?? undefined}
        onSubmit={async (data) => {
          if (editing) {
            await updateDeal(editing.id, data);
            // Sync existing deal to transaction if it already has a transactionId
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
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ ...t.pageTitle, color: t.text }}>Deal Pipeline</h1>
        <button data-tour="add-deal" onClick={() => setShowForm(true)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={16} strokeWidth={2} />
          Add Deal
        </button>
      </div>
      <div data-tour="kanban-board">
        <KanbanBoard deals={deals} onMove={moveDeal} onEdit={setEditing} onDelete={removeDeal} />
      </div>
    </div>
  );
}

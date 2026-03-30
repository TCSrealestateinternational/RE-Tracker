import { useState } from "react";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { KanbanBoard } from "@/components/deals/KanbanBoard";
import { DealForm } from "@/components/deals/DealForm";
import { theme } from "@/styles/theme";
import type { Deal } from "@/types";

export function PipelinePage() {
  const { deals, addDeal, updateDeal, moveDeal } = useDeals();
  const { clients } = useClients();
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: theme.colors.teal }}>Deal Pipeline</h2>
        <button onClick={() => setShowForm(true)} style={{
          padding: "0.5rem 1rem", background: theme.colors.teal, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          + Add Deal
        </button>
      </div>
      <KanbanBoard deals={deals} onMove={moveDeal} onEdit={setEditing} />
    </div>
  );
}

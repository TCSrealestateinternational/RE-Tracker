import { useChecklists } from "@/hooks/useChecklists";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { ChecklistView } from "@/components/checklists/ChecklistView";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { t, card } from "@/styles/theme";

export function ChecklistsPage() {
  const { checklists, toggleItem } = useChecklists();
  const { clients } = useClients();
  const { deals } = useDeals();

  async function handleToggleNotify(checklistId: string, key: string, notify: boolean) {
    const cl = checklists.find((c) => c.id === checklistId);
    if (!cl) return;
    const notifications = { ...(cl.notifications ?? {}), [key]: notify };
    await updateDoc(doc(db, "checklists", checklistId), { notifications, updatedAt: Date.now() });
  }

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Transaction Checklists</h1>

      <div data-tour="checklist-area">
      {checklists.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <p style={{ ...t.body, color: t.textTertiary, marginBottom: "4px" }}>
            No transaction checklists yet.
          </p>
          <p style={{ ...t.caption, color: t.textTertiary }}>
            Add a client as a Buyer or Seller and a checklist will be created automatically.
          </p>
        </div>
      ) : (
        <div className="inline-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {checklists.map((cl) => {
            const client = clients.find((c) => c.id === cl.clientId);
            const deal = deals.find((d) => d.clientId === cl.clientId);
            return (
              <ChecklistView
                key={cl.id}
                checklist={cl}
                clientName={client?.name ?? "Unknown"}
                transactionId={deal?.transactionId}
                onToggle={toggleItem}
                onToggleNotify={handleToggleNotify}
              />
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

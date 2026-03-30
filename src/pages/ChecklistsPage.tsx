import { useChecklists } from "@/hooks/useChecklists";
import { useClients } from "@/hooks/useClients";
import { ChecklistView } from "@/components/checklists/ChecklistView";
import { t, card } from "@/styles/theme";

export function ChecklistsPage() {
  const { checklists, toggleItem } = useChecklists();
  const { clients } = useClients();

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Transaction Checklists</h1>

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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {checklists.map((cl) => {
            const client = clients.find((c) => c.id === cl.clientId);
            return (
              <ChecklistView key={cl.id} checklist={cl} clientName={client?.name ?? "Unknown"} onToggle={toggleItem} />
            );
          })}
        </div>
      )}
    </div>
  );
}

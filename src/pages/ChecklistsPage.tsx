import { useChecklists } from "@/hooks/useChecklists";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { ChecklistView } from "@/components/checklists/ChecklistView";
import { t, card, btnPrimary } from "@/styles/theme";

export function ChecklistsPage() {
  const { checklists, createChecklist, toggleItem } = useChecklists();
  const { deals } = useDeals();
  const { clients } = useClients();

  const eligibleDeals = deals.filter(
    (d) => d.stage === "Under Contract" || d.stage === "Closed"
  );
  const dealsWithoutChecklist = eligibleDeals.filter(
    (d) => !checklists.some((c) => c.dealId === d.id)
  );

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Transaction Checklists</h1>

      {dealsWithoutChecklist.length > 0 && (
        <div style={{
          ...card, background: t.goldLight,
          border: `1px solid rgba(188, 128, 77, 0.15)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ ...t.body, color: t.textSecondary }}>
            {dealsWithoutChecklist.length} deal(s) need checklists
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {dealsWithoutChecklist.map((d) => (
              <button key={d.id} onClick={() => createChecklist(d.clientId, d.id)}
                style={{ ...btnPrimary, padding: "8px 16px", fontSize: "13px" }}>
                {d.clientName}
              </button>
            ))}
          </div>
        </div>
      )}

      {checklists.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <p style={{ ...t.body, color: t.textTertiary, marginBottom: "4px" }}>
            No transaction checklists yet.
          </p>
          <p style={{ ...t.caption, color: t.textTertiary }}>
            Move a deal to "Under Contract" in the Pipeline, then create a checklist to track closing milestones.
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

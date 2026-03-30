import { useChecklists } from "@/hooks/useChecklists";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { ChecklistView } from "@/components/checklists/ChecklistView";
import { theme } from "@/styles/theme";

export function ChecklistsPage() {
  const { checklists, createChecklist, toggleItem } = useChecklists();
  const { deals } = useDeals();
  const { clients } = useClients();

  // Deals that should have checklists (under contract or beyond)
  const eligibleDeals = deals.filter(
    (d) => d.stage === "Under Contract" || d.stage === "Closed"
  );
  const dealsWithoutChecklist = eligibleDeals.filter(
    (d) => !checklists.some((c) => c.dealId === d.id)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: theme.colors.teal }}>Transaction Checklists</h2>
      </div>

      {dealsWithoutChecklist.length > 0 && (
        <div style={{
          background: "#fffbeb", border: `1px solid ${theme.colors.gold}`,
          borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "0.85rem", color: theme.colors.gray700 }}>
            {dealsWithoutChecklist.length} deal(s) under contract need checklists
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {dealsWithoutChecklist.map((d) => (
              <button
                key={d.id}
                onClick={() => createChecklist(d.clientId, d.id)}
                style={{
                  padding: "0.35rem 0.75rem", background: theme.colors.teal,
                  color: theme.colors.white, border: "none", borderRadius: "6px",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                Create for {d.clientName}
              </button>
            ))}
          </div>
        </div>
      )}

      {checklists.length === 0 ? (
        <div style={{
          background: theme.colors.white, borderRadius: "12px", padding: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center",
        }}>
          <p style={{ color: theme.colors.gray500, fontSize: "0.85rem" }}>
            No transaction checklists yet. Move a deal to "Under Contract" in the Pipeline, then create a checklist.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {checklists.map((cl) => {
            const client = clients.find((c) => c.id === cl.clientId);
            return (
              <ChecklistView
                key={cl.id}
                checklist={cl}
                clientName={client?.name ?? "Unknown Client"}
                onToggle={toggleItem}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChecklists } from "@/hooks/useChecklists";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { ChecklistView } from "@/components/checklists/ChecklistView";
import { BUYER_CHECKLIST_TEMPLATE } from "@/constants/checklist-buyer";
import { SELLER_CHECKLIST_TEMPLATE } from "@/constants/checklist-seller";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { t, card } from "@/styles/theme";

export function ChecklistsPage() {
  const { checklists, toggleItem } = useChecklists();
  const { clients } = useClients();
  const { deals } = useDeals();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function handleToggleNotify(checklistId: string, key: string, notify: boolean) {
    const cl = checklists.find((c) => c.id === checklistId);
    if (!cl) return;
    const notifications = { ...(cl.notifications ?? {}), [key]: notify };
    await updateDoc(doc(db, "checklists", checklistId), { notifications, updatedAt: Date.now() });
  }

  const selected = selectedId ? checklists.find((c) => c.id === selectedId) : null;
  const selectedClient = selected ? clients.find((c) => c.id === selected.clientId) : null;
  const selectedDeal = selected ? deals.find((d) => d.clientId === selected.clientId) : null;

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      {!selected && (
        <h1 style={{ ...t.pageTitle, color: t.text }}>Transaction Checklists</h1>
      )}

      {selected && (
        <button
          onClick={() => setSelectedId(null)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "transparent", border: "none", cursor: "pointer",
            color: t.textSecondary, fontFamily: t.font, fontSize: "14px",
            padding: "4px 0", alignSelf: "flex-start",
          }}
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Back to checklists
        </button>
      )}

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
        ) : selected ? (
          <ChecklistView
            checklist={selected}
            clientName={selectedClient?.name ?? "Unknown"}
            transactionId={selectedDeal?.transactionId}
            onToggle={toggleItem}
            onToggleNotify={handleToggleNotify}
          />
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {checklists.map((cl) => {
              const client = clients.find((c) => c.id === cl.clientId);
              const isBuyer = cl.type === "buyer";
              const template = isBuyer ? BUYER_CHECKLIST_TEMPLATE : SELLER_CHECKLIST_TEMPLATE;
              const completed = template.filter((item) => cl.items[item.label]).length;
              const total = template.length;
              const pct = Math.round((completed / total) * 100);
              return (
                <button
                  key={cl.id}
                  onClick={() => setSelectedId(cl.id)}
                  style={{
                    ...card,
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: t.font,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <h3 style={{ ...t.sectionHeader, color: t.text }}>
                        {client?.name ?? "Unknown"}
                      </h3>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                        background: isBuyer ? t.tealLight : t.goldLight,
                        color: isBuyer ? t.teal : t.gold,
                        textTransform: "uppercase",
                      }}>
                        {cl.type}
                      </span>
                      <span style={{
                        ...t.caption, fontWeight: 600, marginLeft: "auto",
                        color: pct === 100 ? t.success : t.textTertiary,
                      }}>
                        {completed}/{total} ({pct}%)
                      </span>
                    </div>
                    <div style={{
                      height: "3px", background: t.tealLight, borderRadius: "2px", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: pct === 100 ? t.success : t.teal,
                        borderRadius: "2px", transition: "width 0.3s",
                      }} />
                    </div>
                  </div>
                  <ChevronRight size={18} color={t.textTertiary} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

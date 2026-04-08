import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useChecklists } from "@/hooks/useChecklists";
import { useDeals } from "@/hooks/useDeals";
import { useTransactionSync } from "@/hooks/useTransactionSync";
import { useAuth } from "@/context/AuthContext";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetail } from "@/components/clients/ClientDetail";
import { AddToHearthModal } from "@/components/clients/AddToHearthModal";
import type { DetailTab } from "@/components/clients/ClientDetail";
import type { Client, ClientStage } from "@/types";
import { calcProjectedCommission } from "@/utils/commission";

type View = "list" | "add" | "detail" | "edit";

export function ClientsPage() {
  const { clients, error: firestoreError, addClient, updateClient, deleteClient } = useClients();
  const { entries } = useTimeEntries();
  const { createChecklist, getClientChecklist, toggleItem } = useChecklists();
  const { deals, updateDeal } = useDeals();
  const { syncDealToTransaction } = useTransactionSync();
  const { profile } = useAuth();
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [hearthPromptClient, setHearthPromptClient] = useState<Client | null>(null);

  const hasHearthAccess = profile?.subscription?.features?.hearthPortal ?? false;

  async function handleDeleteClients(ids: string[]) {
    await Promise.all(ids.map((id) => deleteClient(id)));
  }

  async function handleBulkUpdateStage(ids: string[], stage: ClientStage) {
    await Promise.all(ids.map((id) => updateClient(id, { stage })));
  }

  if (view === "add") {
    return (
      <ClientForm
        onSubmit={async (data) => {
          const newId = await addClient(data);
          await createChecklist(newId, data.status);
          // If agent has Hearth access, prompt to also add client to portal
          if (hasHearthAccess) {
            const newClient = { ...data, id: newId, userId: profile?.id || "", createdAt: Date.now(), updatedAt: Date.now() } as Client;
            setHearthPromptClient(newClient);
          }
          setView("list");
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "edit" && selected) {
    return (
      <ClientForm
        initial={{ ...selected, additionalContacts: selected.additionalContacts ?? [] }}
        onSubmit={async (data) => {
          await updateClient(selected.id, data);

          // Sync overlapping fields to all deals linked to this client
          const updatedClient = { ...selected, ...data } as Client;
          const linkedDeals = deals.filter((d) => d.clientId === selected.id);
          for (const deal of linkedDeals) {
            const projectedCommission =
              data.commissionMode === "flat"
                ? data.commissionFlat
                : calcProjectedCommission(deal.purchasePrice, data.commissionPercent);

            const patch: Partial<typeof deal> = {
              clientName: data.name,
              commissionPercent: data.commissionPercent,
              projectedCommission,
              leadSource: data.leadSource,
              expectedCloseDate:
                data.status === "buyer"
                  ? data.projectedCloseDate ?? ""
                  : data.expectedCloseDate ?? "",
            };

            await updateDeal(deal.id, patch);

            if (deal.transactionId) {
              await syncDealToTransaction(
                { ...deal, ...patch },
                updatedClient,
              );
            }
          }

          setSelected(updatedClient);
          setView("detail");
        }}
        onCancel={() => setView("detail")}
      />
    );
  }

  if (view === "detail" && selected) {
    const checklist = getClientChecklist(selected.id);
    if (!checklist) {
      createChecklist(selected.id, selected.status);
    }
    const deal = deals.find((d) => d.clientId === selected.id);
    return (
      <ClientDetail
        client={selected}
        entries={entries}
        checklist={checklist}
        deal={deal}
        onToggleItem={toggleItem}
        onEdit={() => setView("edit")}
        onBack={() => { setSelected(null); setView("list"); setDetailTab("overview"); }}
        initialTab={detailTab}
      />
    );
  }

  return (
    <>
      {firestoreError && (
        <div style={{
          background: "rgba(157, 68, 42, 0.08)", border: "1px solid #9d442a",
          borderRadius: "8px", padding: "12px 16px", marginBottom: "16px",
          fontSize: "14px", color: "#9d442a",
        }}>
          Firestore error: {firestoreError}
        </div>
      )}
      <ClientList
        clients={clients}
        onSelect={(c) => { setSelected(c); setDetailTab("overview"); setView("detail"); }}
        onClientView={(c) => { setSelected(c); setDetailTab("client-view"); setView("detail"); }}
        onAdd={() => setView("add")}
        onDeleteClients={handleDeleteClients}
        onBulkUpdateStage={handleBulkUpdateStage}
      />
      {hearthPromptClient && (
        <AddToHearthModal
          client={hearthPromptClient}
          onClose={() => setHearthPromptClient(null)}
          onLinked={(hearthUserId) => {
            updateClient(hearthPromptClient.id, { hearthUserId });
          }}
        />
      )}
    </>
  );
}

import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useChecklists } from "@/hooks/useChecklists";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetail } from "@/components/clients/ClientDetail";
import type { Client } from "@/types";

type View = "list" | "add" | "detail" | "edit";

export function ClientsPage() {
  const { clients, error: firestoreError, addClient, updateClient } = useClients();
  const { entries } = useTimeEntries();
  const { createChecklist, getClientChecklist, toggleItem } = useChecklists();
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Client | null>(null);

  if (view === "add") {
    return (
      <ClientForm
        onSubmit={async (data) => {
          const newId = await addClient(data);
          await createChecklist(newId, data.status);
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
          setSelected({ ...selected, ...data } as Client);
          setView("detail");
        }}
        onCancel={() => setView("detail")}
      />
    );
  }

  if (view === "detail" && selected) {
    const checklist = getClientChecklist(selected.id);
    return (
      <ClientDetail
        client={selected}
        entries={entries}
        checklist={checklist}
        onToggleItem={toggleItem}
        onEdit={() => setView("edit")}
        onBack={() => { setSelected(null); setView("list"); }}
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
        onSelect={(c) => { setSelected(c); setView("detail"); }}
        onAdd={() => setView("add")}
      />
    </>
  );
}

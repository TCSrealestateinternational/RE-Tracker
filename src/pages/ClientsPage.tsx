import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetail } from "@/components/clients/ClientDetail";
import type { Client } from "@/types";

type View = "list" | "add" | "detail" | "edit";

export function ClientsPage() {
  const { clients, addClient, updateClient } = useClients();
  const { entries } = useTimeEntries();
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Client | null>(null);

  if (view === "add") {
    return (
      <ClientForm
        onSubmit={async (data) => {
          await addClient(data);
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
    return (
      <ClientDetail
        client={selected}
        entries={entries}
        onEdit={() => setView("edit")}
        onBack={() => { setSelected(null); setView("list"); }}
      />
    );
  }

  return (
    <ClientList
      clients={clients}
      onSelect={(c) => { setSelected(c); setView("detail"); }}
      onAdd={() => setView("add")}
    />
  );
}

import { useState, type FormEvent } from "react";
import type { Deal, DealStage, LeadSource, Client } from "@/types";
import { DEAL_STAGES, LEAD_SOURCES } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface DealFormProps {
  clients: Client[];
  initial?: Deal;
  onSubmit: (data: Omit<Deal, "id" | "userId" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function DealForm({ clients, initial, onSubmit, onCancel }: DealFormProps) {
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [stage, setStage] = useState<DealStage>(initial?.stage ?? "New Lead");
  const [projectedCommission, setProjectedCommission] = useState(initial?.projectedCommission ?? 0);
  const [expectedCloseDate, setExpectedCloseDate] = useState(initial?.expectedCloseDate ?? "");
  const [leadSource, setLeadSource] = useState<LeadSource | "">(initial?.leadSource ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const selectedClient = clients.find((c) => c.id === clientId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId || !selectedClient) return;
    onSubmit({ clientId, clientName: selectedClient.name, stage, projectedCommission, expectedCloseDate, leadSource, notes });
  }

  const labelEl = (text: string) => (
    <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>{text}</span>
  );

  return (
    <form onSubmit={handleSubmit} style={{ ...card, maxWidth: "520px" }}>
      <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "24px" }}>
        {initial ? "Edit Deal" : "New Deal"}
      </h2>
      <div style={{ display: "grid", gap: "16px", marginBottom: "16px" }}>
        <label>{labelEl("Client *")}
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} required style={inputBase}>
            <option value="">Select client...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <label>{labelEl("Stage")}
            <select value={stage} onChange={(e) => setStage(e.target.value as DealStage)} style={inputBase}>
              {DEAL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
          <label>{labelEl("Expected Close")}
            <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} style={inputBase} /></label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <label>{labelEl("Projected Commission ($)")}
            <input type="number" value={projectedCommission} onChange={(e) => setProjectedCommission(+e.target.value)} style={inputBase} /></label>
          <label>{labelEl("Lead Source")}
            <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputBase}>
              <option value="">None</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>
        <label>{labelEl("Notes")}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputBase, resize: "vertical" }} /></label>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button type="submit" style={btnPrimary}>{initial ? "Save" : "Add Deal"}</button>
        <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

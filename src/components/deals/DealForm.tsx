import { useState, type FormEvent } from "react";
import type { Deal, DealStage, LeadSource } from "@/types";
import { DEAL_STAGES, LEAD_SOURCES } from "@/types";
import { theme } from "@/styles/theme";
import type { Client } from "@/types";

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
    onSubmit({
      clientId,
      clientName: selectedClient.name,
      stage,
      projectedCommission,
      expectedCloseDate,
      leadSource,
      notes,
    });
  }

  const inputStyle = {
    width: "100%", padding: "0.5rem", borderRadius: "6px",
    border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem", boxSizing: "border-box" as const,
  };
  const labelStyle = { display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" };

  return (
    <form onSubmit={handleSubmit} style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", maxWidth: "500px",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>
        {initial ? "Edit Deal" : "New Deal"}
      </h2>
      <div style={{ display: "grid", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <label><span style={labelStyle}>Client *</span>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} required style={inputStyle}>
            <option value="">Select client...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label><span style={labelStyle}>Stage</span>
            <select value={stage} onChange={(e) => setStage(e.target.value as DealStage)} style={inputStyle}>
              {DEAL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
          <label><span style={labelStyle}>Expected Close</span>
            <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} style={inputStyle} /></label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label><span style={labelStyle}>Projected Commission ($)</span>
            <input type="number" value={projectedCommission} onChange={(e) => setProjectedCommission(+e.target.value)} style={inputStyle} /></label>
          <label><span style={labelStyle}>Lead Source</span>
            <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputStyle}>
              <option value="">None</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>
        <label><span style={labelStyle}>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></label>
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" style={{
          padding: "0.625rem 1.5rem", background: theme.colors.teal, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          {initial ? "Save" : "Add Deal"}
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: "0.625rem 1.5rem", background: "transparent", border: `1px solid ${theme.colors.gray300}`,
          borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", color: theme.colors.gray700,
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

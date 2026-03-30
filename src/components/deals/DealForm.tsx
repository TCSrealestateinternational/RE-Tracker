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

const COMMISSION_PRESETS = [2, 2.5, 3, 5, 6];

export function DealForm({ clients, initial, onSubmit, onCancel }: DealFormProps) {
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [stage, setStage] = useState<DealStage>(initial?.stage ?? "New Lead");
  const [purchasePriceStr, setPurchasePriceStr] = useState(
    initial?.purchasePrice ? String(initial.purchasePrice) : ""
  );
  const [commissionPctStr, setCommissionPctStr] = useState(
    initial?.commissionPercent ? String(initial.commissionPercent) : "3"
  );
  const [actualCommissionStr, setActualCommissionStr] = useState(
    initial?.actualCommission != null ? String(initial.actualCommission) : ""
  );
  const [expectedCloseDate, setExpectedCloseDate] = useState(initial?.expectedCloseDate ?? "");
  const [actualCloseDate, setActualCloseDate] = useState(initial?.actualCloseDate ?? "");
  const [leadSource, setLeadSource] = useState<LeadSource | "">(initial?.leadSource ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const selectedClient = clients.find((c) => c.id === clientId);

  const purchasePrice = parseFloat(purchasePriceStr) || 0;
  const commissionPercent = parseFloat(commissionPctStr) || 0;
  const projectedCommission = Math.round(purchasePrice * commissionPercent / 100);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId || !selectedClient) return;
    onSubmit({
      clientId,
      clientName: selectedClient.name,
      stage,
      purchasePrice,
      commissionPercent,
      projectedCommission,
      actualCommission: actualCommissionStr ? parseFloat(actualCommissionStr) : null,
      expectedCloseDate,
      actualCloseDate: actualCloseDate || null,
      leadSource,
      notes,
    });
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
          <label>{labelEl("Lead Source")}
            <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputBase}>
              <option value="">None</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>

        {/* ── Commission Calculator ── */}
        <div style={{
          background: t.bg, borderRadius: "10px", padding: "16px",
        }}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "12px" }}>
            Commission Calculator
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
            <label>{labelEl("Purchase Price ($)")}
              <input
                type="text"
                inputMode="decimal"
                value={purchasePriceStr}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setPurchasePriceStr(v);
                }}
                placeholder="250000"
                style={inputBase}
              /></label>
            <div>
              {labelEl("Commission %")}
              <input
                type="text"
                inputMode="decimal"
                value={commissionPctStr}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setCommissionPctStr(v);
                }}
                placeholder="3"
                style={inputBase}
              />
              <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                {COMMISSION_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCommissionPctStr(String(p))}
                    style={{
                      padding: "3px 8px", fontSize: "11px", fontWeight: 600, fontFamily: t.font,
                      background: commissionPctStr === String(p) ? t.teal : t.surface,
                      color: commissionPctStr === String(p) ? t.textInverse : t.textSecondary,
                      border: `1px solid ${t.borderMedium}`,
                      borderRadius: "4px", cursor: "pointer",
                    }}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: t.surface, borderRadius: "8px", padding: "12px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ ...t.body, color: t.textSecondary }}>Projected Commission</span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: t.gold }}>
              ${projectedCommission.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Actual Commission (only relevant for closed deals) ── */}
        {(stage === "Closed" || initial?.actualCommission != null) && (
          <label>{labelEl("Actual Commission ($)")}
            <input
              type="text"
              inputMode="decimal"
              value={actualCommissionStr}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) setActualCommissionStr(v);
              }}
              placeholder={String(projectedCommission)}
              style={inputBase}
            /></label>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <label>{labelEl("Expected Close")}
            <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} style={inputBase} /></label>
          <label>{labelEl("Actual Close Date")}
            <input type="date" value={actualCloseDate} onChange={(e) => setActualCloseDate(e.target.value)} style={inputBase} /></label>
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

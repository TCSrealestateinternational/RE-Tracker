import { useState, type FormEvent } from "react";
import type { Client, ClientStatus, ClientStage, LeadSource } from "@/types";
import { LEAD_SOURCES } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface ClientFormProps {
  initial?: Client;
  onSubmit: (data: Omit<Client, "id" | "userId" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? "buyer");
  const [priceMin, setPriceMin] = useState(initial?.priceRange.min ?? 0);
  const [priceMax, setPriceMax] = useState(initial?.priceRange.max ?? 0);
  const [searchCriteria, setSearchCriteria] = useState(initial?.searchCriteria ?? "");
  const [stage, setStage] = useState<ClientStage>(initial?.stage ?? "prospect");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [commissionEarned, setCommissionEarned] = useState(initial?.commissionEarned ?? 0);
  const [leadSource, setLeadSource] = useState<LeadSource | "">(initial?.leadSource ?? "");
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name, email, phone, status,
      priceRange: { min: priceMin, max: priceMax },
      searchCriteria, stage, notes, commissionEarned,
      leadSource, followUpDate: followUpDate || null,
    });
  }

  const labelEl = (text: string) => (
    <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>{text}</span>
  );

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "24px" }}>
        {initial ? "Edit Client" : "New Client"}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <label>{labelEl("Name *")}
          <input value={name} onChange={(e) => setName(e.target.value)} required style={inputBase} /></label>
        <label>{labelEl("Email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Phone")}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Status")}
          <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} style={inputBase}>
            <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="both">Both</option>
          </select></label>
        <label>{labelEl("Price Min ($)")}
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(+e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Price Max ($)")}
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Stage")}
          <select value={stage} onChange={(e) => setStage(e.target.value as ClientStage)} style={inputBase}>
            <option value="prospect">Prospect</option><option value="active">Active</option>
            <option value="under-contract">Under Contract</option><option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select></label>
        <label>{labelEl("Commission Earned ($)")}
          <input type="number" value={commissionEarned} onChange={(e) => setCommissionEarned(+e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Lead Source")}
          <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputBase}>
            <option value="">None</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></label>
        <label>{labelEl("Follow-Up Date")}
          <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={inputBase} /></label>
      </div>
      <label style={{ display: "block", marginBottom: "16px" }}>
        {labelEl("Search Criteria")}
        <input value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} style={inputBase} />
      </label>
      <label style={{ display: "block", marginBottom: "28px" }}>
        {labelEl("Notes")}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          style={{ ...inputBase, resize: "vertical" }} />
      </label>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit" style={btnPrimary}>
          {initial ? "Save Changes" : "Add Client"}
        </button>
        <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

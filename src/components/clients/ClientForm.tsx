import { useState, type FormEvent } from "react";
import type { Client, ClientStatus, ClientStage, LeadSource } from "@/types";
import { LEAD_SOURCES } from "@/types";
import { theme } from "@/styles/theme";

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

  const inputStyle = {
    width: "100%", padding: "0.5rem", borderRadius: "6px",
    border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem", boxSizing: "border-box" as const,
  };
  const labelStyle = { display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" };

  return (
    <form onSubmit={handleSubmit} style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>
        {initial ? "Edit Client" : "New Client"}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <label><span style={labelStyle}>Name *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} /></label>
        <label><span style={labelStyle}>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></label>
        <label><span style={labelStyle}>Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} /></label>
        <label><span style={labelStyle}>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} style={inputStyle}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="both">Both</option>
          </select></label>
        <label><span style={labelStyle}>Price Min ($)</span>
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(+e.target.value)} style={inputStyle} /></label>
        <label><span style={labelStyle}>Price Max ($)</span>
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} style={inputStyle} /></label>
        <label><span style={labelStyle}>Stage</span>
          <select value={stage} onChange={(e) => setStage(e.target.value as ClientStage)} style={inputStyle}>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="under-contract">Under Contract</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select></label>
        <label><span style={labelStyle}>Commission Earned ($)</span>
          <input type="number" value={commissionEarned} onChange={(e) => setCommissionEarned(+e.target.value)} style={inputStyle} /></label>
        <label><span style={labelStyle}>Lead Source</span>
          <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputStyle}>
            <option value="">None</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></label>
        <label><span style={labelStyle}>Follow-Up Date</span>
          <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={inputStyle} /></label>
      </div>
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        <span style={labelStyle}>Search Criteria</span>
        <input value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} style={inputStyle} />
      </label>
      <label style={{ display: "block", marginBottom: "1rem" }}>
        <span style={labelStyle}>Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          style={{ ...inputStyle, resize: "vertical" }} />
      </label>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" style={{
          padding: "0.625rem 1.5rem", background: theme.colors.teal, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          {initial ? "Save Changes" : "Add Client"}
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

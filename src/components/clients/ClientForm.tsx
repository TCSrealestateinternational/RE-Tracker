import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import type { Client, ClientStatus, ClientStage, LeadSource, ContactPerson } from "@/types";
import { LEAD_SOURCES } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface ClientFormProps {
  initial?: Client;
  onSubmit: (data: Omit<Client, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void> | void;
  onCancel: () => void;
}

const emptyContact = (): ContactPerson => ({ name: "", email: "", phone: "" });

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [additionalContacts, setAdditionalContacts] = useState<ContactPerson[]>(
    initial?.additionalContacts ?? []
  );
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? "buyer");
  const [priceMin, setPriceMin] = useState(initial?.priceRange.min ?? 0);
  const [priceMax, setPriceMax] = useState(initial?.priceRange.max ?? 0);
  const [searchCriteria, setSearchCriteria] = useState(initial?.searchCriteria ?? "");
  const [stage, setStage] = useState<ClientStage>(initial?.stage ?? "prospect");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [commissionEarned, setCommissionEarned] = useState(initial?.commissionEarned ?? 0);
  const [leadSource, setLeadSource] = useState<LeadSource | "">(initial?.leadSource ?? "");
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateContact(index: number, field: keyof ContactPerson, value: string) {
    setAdditionalContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function removeContact(index: number) {
    setAdditionalContacts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Filter out additional contacts with no name
      const validContacts = additionalContacts.filter((c) => c.name.trim());
      await onSubmit({
        name, email, phone,
        additionalContacts: validContacts,
        status,
        priceRange: { min: priceMin, max: priceMax },
        searchCriteria, stage, notes, commissionEarned,
        leadSource, followUpDate: followUpDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client. Please try again.");
      setSaving(false);
    }
  }

  const labelEl = (text: string) => (
    <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>{text}</span>
  );

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "24px" }}>
        {initial ? "Edit Client" : "New Client"}
      </h2>

      {error && (
        <div style={{
          background: t.rustLight, border: `1px solid ${t.rust}`,
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
          ...t.body, color: t.rust,
        }}>
          {error}
        </div>
      )}

      {/* ── Primary Contact ── */}
      <div style={{
        background: t.bg, borderRadius: "10px",
        padding: "16px", marginBottom: "16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ ...t.label, color: t.textSecondary }}>Primary Contact</span>
        </div>
        <div className="grid-3col" style={{ marginBottom: 0 }}>
          <label>{labelEl("Name *")}
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" style={inputBase} /></label>
          <label>{labelEl("Email")}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" style={inputBase} /></label>
          <label>{labelEl("Phone")}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" style={inputBase} /></label>
        </div>
      </div>

      {/* ── Additional Contacts ── */}
      {additionalContacts.map((contact, i) => (
        <div key={i} style={{
          background: t.bg, borderRadius: "10px",
          padding: "16px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ ...t.label, color: t.textSecondary }}>Additional Contact</span>
            <button type="button" onClick={() => removeContact(i)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: t.textTertiary, padding: "2px",
              display: "flex", alignItems: "center",
            }}>
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid-3col" style={{ marginBottom: 0 }}>
            <label>{labelEl("Name")}
              <input value={contact.name} onChange={(e) => updateContact(i, "name", e.target.value)} placeholder="Full name" style={inputBase} /></label>
            <label>{labelEl("Email")}
              <input type="email" value={contact.email} onChange={(e) => updateContact(i, "email", e.target.value)} placeholder="Optional" style={inputBase} /></label>
            <label>{labelEl("Phone")}
              <input value={contact.phone} onChange={(e) => updateContact(i, "phone", e.target.value)} placeholder="Optional" style={inputBase} /></label>
          </div>
        </div>
      ))}

      <button type="button" onClick={() => setAdditionalContacts((prev) => [...prev, emptyContact()])} style={{
        ...btnSecondary, display: "flex", alignItems: "center", gap: "6px",
        marginBottom: "20px", padding: "8px 14px", fontSize: "13px",
      }}>
        <Plus size={14} strokeWidth={2} />
        Add Spouse / Co-Buyer
      </button>

      {/* ── Deal Details ── */}
      <div className="grid-2col" style={{ marginBottom: "16px" }}>
        <label>{labelEl("Status")}
          <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} style={inputBase}>
            <option value="buyer">Buyer</option><option value="seller">Seller</option>
          </select></label>
        <label>{labelEl("Stage")}
          <select value={stage} onChange={(e) => setStage(e.target.value as ClientStage)} style={inputBase}>
            <option value="prospect">Prospect</option><option value="active">Active</option>
            <option value="under-contract">Under Contract</option><option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select></label>
        <label>{labelEl("Lead Source")}
          <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputBase}>
            <option value="">None</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></label>
        <label>{labelEl("Follow-Up Date")}
          <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={inputBase} /></label>
      </div>

      <div className="grid-2col" style={{ marginBottom: "16px" }}>
        <label>{labelEl("Price Min ($)")}
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(+e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Price Max ($)")}
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} style={inputBase} /></label>
      </div>

      <label style={{ display: "block", marginBottom: "16px" }}>
        {labelEl("Commission Earned ($)")}
        <input type="number" value={commissionEarned} onChange={(e) => setCommissionEarned(+e.target.value)} style={{ ...inputBase, maxWidth: "200px" }} />
      </label>

      <label style={{ display: "block", marginBottom: "16px" }}>
        {labelEl("Search Criteria")}
        <input value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} placeholder="Optional" style={inputBase} />
      </label>
      <label style={{ display: "block", marginBottom: "28px" }}>
        {labelEl("Notes")}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional"
          style={{ ...inputBase, resize: "vertical" }} />
      </label>

      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : initial ? "Save Changes" : "Add Client"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

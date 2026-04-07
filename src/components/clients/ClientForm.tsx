import { useState, type FormEvent, type CSSProperties } from "react";
import { Plus, X } from "lucide-react";
import type { Client, ClientStatus, ClientStage, LeadSource, ContactPerson, Offer, OfferStatus, DriveLink } from "@/types";
import { LEAD_SOURCES } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface ClientFormProps {
  initial?: Client;
  onSubmit: (data: Omit<Client, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void> | void;
  onCancel: () => void;
}

const emptyContact = (): ContactPerson => ({ name: "", email: "", phone: "" });

/** Strip leading zeros but keep "0", "0.", "0.5" etc valid */
function sanitizeNumStr(raw: string): string {
  if (raw === "" || raw === "-") return raw;
  // Allow decimal entry like "0." or "123."
  if (/^-?\d+\.$/.test(raw)) return raw;
  // Remove leading zeros from integer part (but keep "0.x")
  const cleaned = raw.replace(/^(-?)0+(\d)/, "$1$2");
  // Only allow valid decimal number chars
  if (/^-?\d*\.?\d*$/.test(cleaned)) return cleaned;
  return raw;
}

function numStrToNum(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function numToStr(n: number | undefined | null): string {
  if (n == null || n === 0) return "";
  return String(n);
}

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [additionalContacts, setAdditionalContacts] = useState<ContactPerson[]>(
    initial?.additionalContacts ?? []
  );
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? "buyer");
  const [stage, setStage] = useState<ClientStage>(initial?.stage ?? "prospect");
  const [leadSource, setLeadSource] = useState<LeadSource | "">(initial?.leadSource ?? "");
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [commissionEarned, setCommissionEarned] = useState(numToStr(initial?.commissionEarned));

  // Commission toggle
  const [commissionMode, setCommissionMode] = useState<"percentage" | "flat">(initial?.commissionMode ?? "percentage");
  const [commissionPercent, setCommissionPercent] = useState(numToStr(initial?.commissionPercent));
  const [commissionFlat, setCommissionFlat] = useState(numToStr(initial?.commissionFlat));

  // Buyer fields
  const [lenderName, setLenderName] = useState(initial?.lenderName ?? "");
  const [preApprovalAmount, setPreApprovalAmount] = useState(numToStr(initial?.preApprovalAmount));
  const [priceMin, setPriceMin] = useState(numToStr(initial?.priceRange?.min));
  const [priceMax, setPriceMax] = useState(numToStr(initial?.priceRange?.max));
  const [searchCriteria, setSearchCriteria] = useState(initial?.searchCriteria ?? "");
  const [dateUnderContract, setDateUnderContract] = useState(initial?.dateUnderContract ?? "");
  const [projectedCloseDate, setProjectedCloseDate] = useState(initial?.projectedCloseDate ?? "");

  // Seller fields
  const [propertyAddress, setPropertyAddress] = useState(initial?.propertyAddress ?? "");
  const [listPrice, setListPrice] = useState(numToStr(initial?.listPrice));
  const [priceReductions, setPriceReductions] = useState<string[]>(
    (initial?.priceReductions ?? []).map(String)
  );
  const [offers, setOffers] = useState<Offer[]>(initial?.offers ?? []);
  const [acceptedOfferDate, setAcceptedOfferDate] = useState(initial?.acceptedOfferDate ?? "");
  const [expectedCloseDate, setExpectedCloseDate] = useState(initial?.expectedCloseDate ?? "");

  // Drive links
  const [driveLinks, setDriveLinks] = useState<DriveLink[]>(initial?.driveLinks ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Derived: base price for commission calculation
  const basePrice = status === "buyer" ? numStrToNum(priceMax) : numStrToNum(listPrice);
  const calculatedCommission =
    commissionMode === "percentage"
      ? basePrice * (numStrToNum(commissionPercent) / 100)
      : numStrToNum(commissionFlat);

  function updateContact(index: number, field: keyof ContactPerson, value: string) {
    setAdditionalContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function removeContact(index: number) {
    setAdditionalContacts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleNumInput(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") { setter(""); return; }
      if (/^-?\d*\.?\d*$/.test(raw)) setter(sanitizeNumStr(raw));
    };
  }

  // Offer management
  function addOffer() {
    setOffers((prev) => [...prev, { amount: 0, status: "countered" }]);
  }
  function updateOffer(index: number, field: keyof Offer, value: number | OfferStatus) {
    setOffers((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
    );
  }
  function removeOffer(index: number) {
    setOffers((prev) => prev.filter((_, i) => i !== index));
  }

  // Price reduction management
  function addPriceReduction() {
    setPriceReductions((prev) => [...prev, ""]);
  }
  function updatePriceReduction(index: number, value: string) {
    if (value !== "" && !/^-?\d*\.?\d*$/.test(value)) return;
    setPriceReductions((prev) =>
      prev.map((r, i) => (i === index ? sanitizeNumStr(value) : r))
    );
  }
  function removePriceReduction(index: number) {
    setPriceReductions((prev) => prev.filter((_, i) => i !== index));
  }

  // Drive link management
  function addDriveLink() {
    setDriveLinks((prev) => [...prev, { label: "", url: "" }]);
  }
  function updateDriveLink(index: number, field: keyof DriveLink, value: string) {
    setDriveLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  }
  function removeDriveLink(index: number) {
    setDriveLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const validContacts = additionalContacts.filter((c) => c.name.trim());
      await onSubmit({
        name, email, phone,
        additionalContacts: validContacts,
        status, stage, notes,
        leadSource,
        followUpDate: followUpDate || null,
        commissionEarned: numStrToNum(commissionEarned),
        commissionMode,
        commissionPercent: numStrToNum(commissionPercent),
        commissionFlat: numStrToNum(commissionFlat),
        // Buyer
        lenderName,
        preApprovalAmount: numStrToNum(preApprovalAmount),
        priceRange: { min: numStrToNum(priceMin), max: numStrToNum(priceMax) },
        searchCriteria,
        dateUnderContract: dateUnderContract || null,
        projectedCloseDate: projectedCloseDate || null,
        // Seller
        propertyAddress,
        listPrice: numStrToNum(listPrice),
        priceReductions: priceReductions.map(numStrToNum).filter((n) => n > 0),
        offers,
        acceptedOfferDate: acceptedOfferDate || null,
        expectedCloseDate: expectedCloseDate || null,
        driveLinks: driveLinks.filter((l) => l.url.trim()),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client. Please try again.");
      setSaving(false);
    }
  }

  const labelEl = (text: string) => (
    <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>{text}</span>
  );

  const isBuyer = status === "buyer";

  const pillBtn = (active: boolean): CSSProperties => ({
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: t.font,
    border: `1px solid ${active ? t.teal : t.borderMedium}`,
    background: active ? t.teal : "transparent",
    color: active ? t.textInverse : t.textSecondary,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const sectionBox: CSSProperties = {
    background: t.bg, borderRadius: "10px",
    padding: "16px", marginBottom: "16px",
  };

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
      <div style={sectionBox}>
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
        <div key={i} style={sectionBox}>
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
        Add Spouse / Co-{isBuyer ? "Buyer" : "Seller"}
      </button>

      {/* ── Shared Fields ── */}
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

      {/* ── Buyer-Only Fields ── */}
      {isBuyer && (
        <div style={sectionBox}>
          <span style={{ ...t.label, color: t.teal, display: "block", marginBottom: "14px" }}>Buyer Details</span>
          <div className="grid-2col" style={{ marginBottom: "12px" }}>
            <label>{labelEl("Lender")}
              <input value={lenderName} onChange={(e) => setLenderName(e.target.value)} placeholder="Lender name or company" style={inputBase} /></label>
            <label>{labelEl("Pre-Approval Amount ($)")}
              <input value={preApprovalAmount} onChange={handleNumInput(setPreApprovalAmount)} placeholder="0" style={inputBase} inputMode="decimal" /></label>
          </div>
          <div className="grid-2col" style={{ marginBottom: "12px" }}>
            <label>{labelEl("Price Min ($)")}
              <input value={priceMin} onChange={handleNumInput(setPriceMin)} placeholder="0" style={inputBase} inputMode="decimal" /></label>
            <label>{labelEl("Price Max ($)")}
              <input value={priceMax} onChange={handleNumInput(setPriceMax)} placeholder="0" style={inputBase} inputMode="decimal" /></label>
          </div>
          <div className="grid-2col" style={{ marginBottom: "12px" }}>
            <label>{labelEl("Date Under Contract")}
              <input type="date" value={dateUnderContract} onChange={(e) => setDateUnderContract(e.target.value)} style={inputBase} /></label>
            <label>{labelEl("Projected Close Date")}
              <input type="date" value={projectedCloseDate} onChange={(e) => setProjectedCloseDate(e.target.value)} style={inputBase} /></label>
          </div>
          <label style={{ display: "block", marginBottom: 0 }}>
            {labelEl("Search Criteria")}
            <input value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} placeholder="Optional" style={inputBase} />
          </label>
        </div>
      )}

      {/* ── Seller-Only Fields ── */}
      {!isBuyer && (
        <div style={sectionBox}>
          <span style={{ ...t.label, color: t.gold, display: "block", marginBottom: "14px" }}>Seller Details</span>

          <label style={{ display: "block", marginBottom: "12px" }}>
            {labelEl("Property Address")}
            <input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="123 Main St, City, KY 40000" style={inputBase} />
          </label>

          <label style={{ display: "block", marginBottom: "12px" }}>
            {labelEl("List Price ($)")}
            <input value={listPrice} onChange={handleNumInput(setListPrice)} placeholder="0" style={inputBase} inputMode="decimal" />
          </label>

          {/* Price Reductions */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              {labelEl("Price Reductions")}
              <button type="button" onClick={addPriceReduction} style={{
                ...btnSecondary, padding: "4px 10px", fontSize: "12px",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <Plus size={12} strokeWidth={2} /> Add Reduction
              </button>
            </div>
            {priceReductions.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                <input
                  value={r}
                  onChange={(e) => updatePriceReduction(i, e.target.value)}
                  placeholder="Reduction amount"
                  style={{ ...inputBase, flex: 1 }}
                  inputMode="decimal"
                />
                <button type="button" onClick={() => removePriceReduction(i)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textTertiary, padding: "4px", display: "flex", alignItems: "center",
                }}>
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          {/* Offers Received */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              {labelEl("Offers Received")}
              <button type="button" onClick={addOffer} style={{
                ...btnSecondary, padding: "4px 10px", fontSize: "12px",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <Plus size={12} strokeWidth={2} /> Add Offer
              </button>
            </div>
            {offers.map((offer, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                <input
                  value={offer.amount || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
                      updateOffer(i, "amount", v === "" ? 0 : parseFloat(sanitizeNumStr(v)) || 0);
                    }
                  }}
                  placeholder="Amount"
                  style={{ ...inputBase, flex: 1 }}
                  inputMode="decimal"
                />
                <select
                  value={offer.status}
                  onChange={(e) => updateOffer(i, "status", e.target.value as OfferStatus)}
                  style={{ ...inputBase, flex: 0, width: "140px" }}
                >
                  <option value="countered">Countered</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button type="button" onClick={() => removeOffer(i)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: t.textTertiary, padding: "4px", display: "flex", alignItems: "center",
                }}>
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          <div className="grid-2col" style={{ marginBottom: 0 }}>
            <label>{labelEl("Accepted Offer Date")}
              <input type="date" value={acceptedOfferDate} onChange={(e) => setAcceptedOfferDate(e.target.value)} style={inputBase} /></label>
            <label>{labelEl("Expected Close Date")}
              <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} style={inputBase} /></label>
          </div>
        </div>
      )}

      {/* ── Projected Commission (both) ── */}
      <div style={sectionBox}>
        <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "10px" }}>Projected Commission</span>
        <div style={{ display: "flex", gap: "0", marginBottom: "12px" }}>
          <button type="button" onClick={() => setCommissionMode("percentage")}
            style={{ ...pillBtn(commissionMode === "percentage"), borderRadius: "8px 0 0 8px" }}>
            %
          </button>
          <button type="button" onClick={() => setCommissionMode("flat")}
            style={{ ...pillBtn(commissionMode === "flat"), borderRadius: "0 8px 8px 0", borderLeft: "none" }}>
            $
          </button>
        </div>
        {commissionMode === "percentage" ? (
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              {labelEl("Commission %")}
              <input value={commissionPercent} onChange={handleNumInput(setCommissionPercent)} placeholder="3" style={{ ...inputBase, maxWidth: "120px" }} inputMode="decimal" />
            </label>
            {basePrice > 0 && numStrToNum(commissionPercent) > 0 && (
              <div style={{ ...t.caption, color: t.teal }}>
                Calculated: ${calculatedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {" "}({commissionPercent}% of ${basePrice.toLocaleString()})
              </div>
            )}
          </div>
        ) : (
          <label style={{ display: "block" }}>
            {labelEl("Commission Amount ($)")}
            <input value={commissionFlat} onChange={handleNumInput(setCommissionFlat)} placeholder="0" style={{ ...inputBase, maxWidth: "200px" }} inputMode="decimal" />
          </label>
        )}
      </div>

      {/* ── Commission Earned ── */}
      <label style={{ display: "block", marginBottom: "16px" }}>
        {labelEl("Commission Earned ($)")}
        <input value={commissionEarned} onChange={handleNumInput(setCommissionEarned)} placeholder="0" style={{ ...inputBase, maxWidth: "200px" }} inputMode="decimal" />
      </label>

      <label style={{ display: "block", marginBottom: "16px" }}>
        {labelEl("Notes")}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional"
          style={{ ...inputBase, resize: "vertical" }} />
      </label>

      {/* ── Google Drive Links ── */}
      <div style={sectionBox}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ ...t.label, color: t.textSecondary }}>Google Drive Links</span>
          <button type="button" onClick={addDriveLink} style={{
            ...btnSecondary, padding: "4px 10px", fontSize: "12px",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <Plus size={12} strokeWidth={2} /> Add Link
          </button>
        </div>
        {driveLinks.length === 0 && (
          <p style={{ ...t.caption, color: t.textTertiary }}>
            No links yet. Add a Google Drive folder or document link.
          </p>
        )}
        {driveLinks.map((link, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
            <input
              value={link.label}
              onChange={(e) => updateDriveLink(i, "label", e.target.value)}
              placeholder="Label (e.g. Client Folder)"
              style={{ ...inputBase, flex: "1 0 100px", maxWidth: "160px" }}
            />
            <input
              value={link.url}
              onChange={(e) => updateDriveLink(i, "url", e.target.value)}
              placeholder="https://drive.google.com/..."
              style={{ ...inputBase, flex: 1 }}
            />
            <button type="button" onClick={() => removeDriveLink(i)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: t.textTertiary, padding: "4px", display: "flex", alignItems: "center",
            }}>
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : initial ? "Save Changes" : "Add Client"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

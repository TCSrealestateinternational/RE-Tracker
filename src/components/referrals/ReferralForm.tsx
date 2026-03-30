import { useState, type FormEvent, type CSSProperties } from "react";
import type { Referral, ReferralStatus } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface ReferralFormProps {
  initial?: Referral;
  onSubmit: (data: Omit<Referral, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void> | void;
  onCancel: () => void;
}

/** Strip leading zeros but keep "0", "0.", "0.5" etc valid */
function sanitizeNumStr(raw: string): string {
  if (raw === "" || raw === "-") return raw;
  if (/^-?\d+\.$/.test(raw)) return raw;
  const cleaned = raw.replace(/^(-?)0+(\d)/, "$1$2");
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

export function ReferralForm({ initial, onSubmit, onCancel }: ReferralFormProps) {
  const [agentName, setAgentName] = useState(initial?.agentName ?? "");
  const [agentEmail, setAgentEmail] = useState(initial?.agentEmail ?? "");
  const [agentPhone, setAgentPhone] = useState(initial?.agentPhone ?? "");
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [referralDate, setReferralDate] = useState(initial?.referralDate ?? "");
  const [expectedCommission, setExpectedCommission] = useState(numToStr(initial?.expectedCommission));
  const [referralPercent, setReferralPercent] = useState(initial ? numToStr(initial.referralPercent) : "25");
  const [status, setStatus] = useState<ReferralStatus>(initial?.status ?? "pending");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-calculate referral fee
  const calculatedFee = numStrToNum(expectedCommission) * numStrToNum(referralPercent) / 100;

  function handleNumInput(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") { setter(""); return; }
      if (/^-?\d*\.?\d*$/.test(raw)) setter(sanitizeNumStr(raw));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const expComm = numStrToNum(expectedCommission);
      const pct = numStrToNum(referralPercent);
      await onSubmit({
        agentName,
        agentEmail,
        agentPhone,
        clientName,
        referralDate: referralDate || "",
        expectedCommission: expComm,
        referralPercent: pct,
        referralFee: expComm * pct / 100,
        status,
        notes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save referral. Please try again.");
      setSaving(false);
    }
  }

  const labelEl = (text: string) => (
    <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>{text}</span>
  );

  const sectionBox: CSSProperties = {
    background: t.bg, borderRadius: "10px",
    padding: "16px", marginBottom: "16px",
  };

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "24px" }}>
        {initial ? "Edit Referral" : "New Referral"}
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

      {/* ── Receiving Agent ── */}
      <div style={sectionBox}>
        <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "12px" }}>Receiving Agent</span>
        <div className="grid-3col" style={{ marginBottom: 0 }}>
          <label>{labelEl("Agent Name *")}
            <input value={agentName} onChange={(e) => setAgentName(e.target.value)} required placeholder="Full name" style={inputBase} /></label>
          <label>{labelEl("Agent Email")}
            <input type="email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} placeholder="Optional" style={inputBase} /></label>
          <label>{labelEl("Agent Phone")}
            <input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} placeholder="Optional" style={inputBase} /></label>
        </div>
      </div>

      {/* ── Referral Details ── */}
      <div className="grid-2col" style={{ marginBottom: "16px" }}>
        <label>{labelEl("Client Name *")}
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Person referred" style={inputBase} /></label>
        <label>{labelEl("Referral Date")}
          <input type="date" value={referralDate} onChange={(e) => setReferralDate(e.target.value)} style={inputBase} /></label>
        <label>{labelEl("Status")}
          <select value={status} onChange={(e) => setStatus(e.target.value as ReferralStatus)} style={inputBase}>
            <option value="pending">Pending</option>
            <option value="under-contract">Under Contract</option>
            <option value="closed">Closed</option>
            <option value="paid">Paid</option>
            <option value="lost">Lost</option>
          </select></label>
      </div>

      {/* ── Commission / Fee ── */}
      <div style={sectionBox}>
        <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "12px" }}>Commission &amp; Fee</span>
        <div className="grid-3col" style={{ marginBottom: "8px" }}>
          <label>{labelEl("Expected Commission ($)")}
            <input value={expectedCommission} onChange={handleNumInput(setExpectedCommission)} placeholder="0" style={inputBase} inputMode="decimal" /></label>
          <label>{labelEl("Referral %")}
            <input value={referralPercent} onChange={handleNumInput(setReferralPercent)} placeholder="25" style={inputBase} inputMode="decimal" /></label>
          <div>
            {labelEl("Referral Fee")}
            <div style={{
              padding: "10px 12px", borderRadius: "8px",
              background: t.bg, border: `1px solid ${t.border}`,
              fontSize: "14px", fontWeight: 600, color: t.gold, fontFamily: t.font,
            }}>
              ${calculatedFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        {numStrToNum(expectedCommission) > 0 && numStrToNum(referralPercent) > 0 && (
          <div style={{ ...t.caption, color: t.teal }}>
            {referralPercent}% of ${numStrToNum(expectedCommission).toLocaleString()} = ${calculatedFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <label style={{ display: "block", marginBottom: "16px" }}>
        {labelEl("Notes")}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional"
          style={{ ...inputBase, resize: "vertical" }} />
      </label>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : initial ? "Save Changes" : "Add Referral"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

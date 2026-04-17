import { useState, type FormEvent, type CSSProperties } from "react";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/types";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { MILEAGE_RATE } from "@/constants/finance-tips";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface ExpenseFormProps {
  initial?: Expense;
  type: "expense" | "mileage";
  onSubmit: (data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void> | void;
  onCancel: () => void;
}

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

export function ExpenseForm({ initial, type, onSubmit, onCancel }: ExpenseFormProps) {
  const { deals } = useDeals();
  const { clients } = useClients();

  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(
    initial?.category ?? (type === "mileage" ? "Vehicle & Mileage" : "Other")
  );
  const [amount, setAmount] = useState(numToStr(initial?.amount));
  const [dealId, setDealId] = useState(initial?.dealId ?? "");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [hasReceipt, setHasReceipt] = useState(initial?.hasReceipt ?? false);

  // Mileage fields
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [miles, setMiles] = useState(numToStr(initial?.miles));
  const [roundTrip, setRoundTrip] = useState(initial?.roundTrip ?? false);
  const [mileageRate, setMileageRate] = useState(numToStr(initial?.mileageRate ?? MILEAGE_RATE));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isMileage = type === "mileage";

  // Auto-calculate mileage amount
  const effectiveMiles = roundTrip ? numStrToNum(miles) * 2 : numStrToNum(miles);
  const calculatedMileageAmount = effectiveMiles * numStrToNum(mileageRate);

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
      await onSubmit({
        type,
        date,
        description,
        category: isMileage ? "Vehicle & Mileage" : category,
        amount: isMileage ? calculatedMileageAmount : numStrToNum(amount),
        dealId: dealId || null,
        clientId: clientId || null,
        notes,
        miles: isMileage ? numStrToNum(miles) : null,
        mileageRate: isMileage ? numStrToNum(mileageRate) : null,
        destination: isMileage ? destination : "",
        roundTrip: isMileage ? roundTrip : false,
        hasReceipt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
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
        {initial ? (isMileage ? "Edit Mileage" : "Edit Expense") : (isMileage ? "Log Mileage" : "Add Expense")}
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

      {/* ── Core Details ── */}
      <div className="grid-2col" style={{ marginBottom: "16px" }}>
        <label>{labelEl("Date *")}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={inputBase} />
        </label>
        <label>{labelEl("Description *")}
          <input value={description} onChange={(e) => setDescription(e.target.value)} required
            placeholder={isMileage ? "e.g. Showing at 123 Main St" : "e.g. Yard signs for listing"}
            style={inputBase} />
        </label>
      </div>

      {/* ── Mileage Section ── */}
      {isMileage && (
        <div style={sectionBox}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "12px" }}>Mileage Details</span>
          <div className="grid-2col" style={{ marginBottom: "12px" }}>
            <label>{labelEl("Destination *")}
              <input value={destination} onChange={(e) => setDestination(e.target.value)} required
                placeholder="e.g. 123 Main St, Lexington KY" style={inputBase} />
            </label>
            <label>{labelEl("Miles (one way) *")}
              <input value={miles} onChange={handleNumInput(setMiles)} required
                placeholder="0" style={inputBase} inputMode="decimal" />
            </label>
          </div>
          <div className="grid-2col" style={{ marginBottom: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} />
              <span style={{ ...t.body, color: t.text }}>Round trip (doubles miles)</span>
            </label>
            <label>{labelEl("Rate per mile ($)")}
              <input value={mileageRate} onChange={handleNumInput(setMileageRate)}
                placeholder={String(MILEAGE_RATE)} style={inputBase} inputMode="decimal" />
            </label>
          </div>
          {numStrToNum(miles) > 0 && (
            <div style={{
              padding: "12px 16px", borderRadius: "8px",
              background: t.tealLight, border: `1px solid rgba(79, 108, 75, 0.15)`,
            }}>
              <span style={{ ...t.label, color: t.teal, display: "block", marginBottom: "4px" }}>Calculated Deduction</span>
              <span style={{ ...t.stat, fontSize: "20px", color: t.teal }}>
                ${calculatedMileageAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ ...t.caption, color: t.textTertiary, marginLeft: "8px" }}>
                ({effectiveMiles} mi × ${numStrToNum(mileageRate).toFixed(3)})
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Expense Amount + Category ── */}
      {!isMileage && (
        <div className="grid-2col" style={{ marginBottom: "16px" }}>
          <label>{labelEl("Amount ($) *")}
            <input value={amount} onChange={handleNumInput(setAmount)} required
              placeholder="0.00" style={inputBase} inputMode="decimal" />
          </label>
          <label>{labelEl("Category")}
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} style={inputBase}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* ── Link to Deal / Client ── */}
      <div style={sectionBox}>
        <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "12px" }}>Link to Deal or Client (Optional)</span>
        <div className="grid-2col" style={{ marginBottom: 0 }}>
          <label>{labelEl("Deal")}
            <select value={dealId} onChange={(e) => setDealId(e.target.value)} style={inputBase}>
              <option value="">None</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.clientName} — {d.stage}</option>
              ))}
            </select>
          </label>
          <label>{labelEl("Client")}
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputBase}>
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Notes + Receipt ── */}
      <label style={{ display: "block", marginBottom: "12px" }}>
        {labelEl("Notes")}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Optional" style={{ ...inputBase, resize: "vertical" }} />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", cursor: "pointer" }}>
        <input type="checkbox" checked={hasReceipt} onChange={(e) => setHasReceipt(e.target.checked)} />
        <span style={{ ...t.body, color: t.text }}>I have a receipt for this expense</span>
      </label>

      {/* ── Buttons ── */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : initial ? "Save Changes" : (isMileage ? "Log Mileage" : "Add Expense")}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

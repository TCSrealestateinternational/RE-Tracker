import { useState, useEffect, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { ACTIVITY_CATEGORIES, LEAD_SOURCES, type ActivityCategory, type LeadSource, type TimeEntry } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

interface ManualEntryProps {
  initial?: TimeEntry | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

export function ManualEntry({ initial, onCancel, onSaved }: ManualEntryProps) {
  const { addManualEntry, updateTimeEntry } = useTimeEntries();
  const { clients } = useClients();
  const isEditing = !!initial;

  const [category, setCategory] = useState<ActivityCategory>("Lead Gen");
  const [clientId, setClientId] = useState("");
  const [leadSource, setLeadSource] = useState<LeadSource | "">("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  useEffect(() => {
    if (initial) {
      setCategory(initial.category);
      setClientId(initial.clientId ?? "");
      setLeadSource(initial.leadSource);
      setNote(initial.note);
      const d = new Date(initial.startTime);
      setDate(d.toISOString().slice(0, 10));
      setStartTime(d.toTimeString().slice(0, 5));
      if (initial.endTime) {
        setEndTime(new Date(initial.endTime).toTimeString().slice(0, 5));
      }
    }
  }, [initial]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const start = new Date(`${date}T${startTime}`).getTime();
    const end = new Date(`${date}T${endTime}`).getTime();
    if (end <= start) return;

    const payload = { category, clientId: clientId || null, leadSource, note, startTime: start, endTime: end };

    if (isEditing) {
      await updateTimeEntry(initial.id, payload);
      onSaved?.();
    } else {
      await addManualEntry(payload);
      setNote("");
    }
  }

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
        {isEditing ? "Edit Entry" : "Manual Entry"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-2col" style={{ marginBottom: "12px" }}>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)} style={inputBase}>
              {ACTIVITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Client</span>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputBase}>
              <option value="">None</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.status === "seller" ? "🏠" : "📋"} {c.name}</option>)}
            </select>
          </label>
        </div>
        <div className="grid-4col" style={{ marginBottom: "12px" }}>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputBase} />
          </label>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Start</span>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputBase} />
          </label>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>End</span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputBase} />
          </label>
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Lead Source</span>
            <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={inputBase}>
              <option value="">None</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <label style={{ display: "block", marginBottom: "24px" }}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Note</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" style={inputBase} />
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
            {isEditing ? <><Save size={16} strokeWidth={2} /> Save Changes</> : <><Plus size={16} strokeWidth={2} /> Add Entry</>}
          </button>
          {isEditing && onCancel && (
            <button type="button" onClick={onCancel} style={{ ...btnSecondary, display: "flex", alignItems: "center", gap: "8px" }}>
              <X size={16} strokeWidth={2} /> Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

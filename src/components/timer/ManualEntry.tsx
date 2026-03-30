import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { ACTIVITY_CATEGORIES, LEAD_SOURCES, type ActivityCategory, type LeadSource } from "@/types";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";

export function ManualEntry() {
  const { addManualEntry } = useTimeEntries();
  const { clients } = useClients();
  const [category, setCategory] = useState<ActivityCategory>("Lead Gen");
  const [clientId, setClientId] = useState("");
  const [leadSource, setLeadSource] = useState<LeadSource | "">("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const start = new Date(`${date}T${startTime}`).getTime();
    const end = new Date(`${date}T${endTime}`).getTime();
    if (end <= start) return;
    await addManualEntry({ category, clientId: clientId || null, leadSource, note, startTime: start, endTime: end });
    setNote("");
  }

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Manual Entry</h3>
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
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
        <button type="submit" style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={16} strokeWidth={2} />
          Add Entry
        </button>
      </form>
    </div>
  );
}

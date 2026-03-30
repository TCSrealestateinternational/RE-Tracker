import { useState, type FormEvent } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { ACTIVITY_CATEGORIES, LEAD_SOURCES, type ActivityCategory, type LeadSource } from "@/types";
import { theme } from "@/styles/theme";

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
    await addManualEntry({
      category,
      clientId: clientId || null,
      leadSource,
      note,
      startTime: start,
      endTime: end,
    });
    setNote("");
  }

  const selectStyle = {
    width: "100%", padding: "0.5rem", borderRadius: "6px",
    border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem",
  };
  const inputStyle = { ...selectStyle, boxSizing: "border-box" as const };

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>Manual Entry</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)} style={selectStyle}>
              {ACTIVITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Client (optional)</span>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={selectStyle}>
              <option value="">None</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </label>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Start</span>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
          </label>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>End</span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
          </label>
          <label>
            <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Lead Source</span>
            <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)} style={selectStyle}>
              <option value="">None</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Note</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" style={inputStyle} />
        </label>
        <button type="submit" style={{
          padding: "0.625rem 1.5rem", background: theme.colors.gold, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          Add Entry
        </button>
      </form>
    </div>
  );
}

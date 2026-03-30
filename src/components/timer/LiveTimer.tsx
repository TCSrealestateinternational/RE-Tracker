import { Play, Square, X } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useClients } from "@/hooks/useClients";
import { ACTIVITY_CATEGORIES, LEAD_SOURCES, type LeadSource } from "@/types";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";
import { formatTime } from "@/utils/dates";

export function LiveTimer() {
  const timer = useTimer();
  const { clients } = useClients();

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Live Timer</h3>

      <div style={{
        textAlign: "center",
        padding: "20px 0",
        marginBottom: "24px",
      }}>
        <span style={{
          fontFamily: "'Manrope', monospace",
          fontSize: "48px",
          fontWeight: 700,
          color: timer.running ? t.teal : t.text,
          letterSpacing: "-0.02em",
        }}>
          {formatTime(timer.elapsed)}
        </span>
      </div>

      <div className="grid-2col" style={{ marginBottom: "12px" }}>
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Category</span>
          <select value={timer.category} onChange={(e) => timer.setCategory(e.target.value as typeof timer.category)}
            disabled={timer.running} style={inputBase}>
            {ACTIVITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Client</span>
          <select value={timer.clientId ?? ""} onChange={(e) => timer.setClientId(e.target.value || null)}
            disabled={timer.running} style={inputBase}>
            <option value="">None</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid-2col" style={{ marginBottom: "24px" }}>
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Lead Source</span>
          <select value={timer.leadSource} onChange={(e) => timer.setLeadSource(e.target.value as LeadSource)}
            disabled={timer.running} style={inputBase}>
            <option value="">None</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Note</span>
          <input value={timer.note} onChange={(e) => timer.setNote(e.target.value)}
            placeholder="What are you working on?" style={inputBase} />
        </label>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        {!timer.running ? (
          <button onClick={timer.start} style={{ ...btnPrimary, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Play size={16} strokeWidth={2} />
            Start
          </button>
        ) : (
          <>
            <button onClick={timer.stop} style={{
              ...btnPrimary, flex: 1, background: t.rust,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              <Square size={14} strokeWidth={2} />
              Stop & Save
            </button>
            <button onClick={timer.reset} style={{
              padding: "10px 16px", background: "transparent", border: `1px solid ${t.border}`,
              borderRadius: "8px", cursor: "pointer", color: t.textTertiary, fontFamily: t.font,
              display: "flex", alignItems: "center", gap: "6px", fontSize: "14px",
            }}>
              <X size={14} strokeWidth={1.5} />
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

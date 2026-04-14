import { Icon } from "@/components/shared/Icon";
import { useTimer } from "@/hooks/useTimer";
import { useClients } from "@/hooks/useClients";
import { ACTIVITY_CATEGORIES, LEAD_SOURCES, type LeadSource } from "@/types";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";
import { formatTime } from "@/utils/dates";

export function LiveTimer() {
  const timer = useTimer();
  const { clients } = useClients();

  return (
    <div className="timer-card" style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Live Timer</h3>

      <div className="timer-display-wrap" style={{
        textAlign: "center",
        padding: "20px 0",
        marginBottom: "24px",
      }}>
        {timer.running && (
          <span className="animate-pulse" style={{
            display: "inline-block",
            width: "8px", height: "8px", borderRadius: "50%",
            background: t.gold,
            marginBottom: "12px",
          }} />
        )}
        <span className="timer-display" style={{
          display: "block",
          fontFamily: t.fontHeadline,
          fontSize: "80px",
          fontWeight: 300,
          fontStyle: "italic",
          color: timer.running ? t.teal : t.text,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {formatTime(timer.elapsed)}
        </span>
      </div>

      <div className="grid-2col" style={{ marginBottom: "12px" }}>
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Category</span>
          <select value={timer.category} onChange={(e) => {
              const val = e.target.value as typeof timer.category;
              timer.setCategory(val);
              if (val !== "Lead Gen") timer.setLeadSource("");
            }}
            disabled={timer.running} style={inputBase}>
            {ACTIVITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Client</span>
          <select value={timer.clientId ?? ""} onChange={(e) => timer.setClientId(e.target.value || null)}
            disabled={timer.running} style={inputBase}>
            <option value="">None</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.status === "buyer" ? "🏠" : "📄"} {c.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid-2col" style={{ marginBottom: "24px" }}>
        {timer.category === "Lead Gen" && (
          <label>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Lead Source</span>
            <select value={timer.leadSource} onChange={(e) => timer.setLeadSource(e.target.value as LeadSource)}
              disabled={timer.running} style={inputBase}>
              <option value="">None</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <label>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Note</span>
          <input value={timer.note} onChange={(e) => timer.setNote(e.target.value)}
            placeholder="What are you working on?" style={inputBase} />
        </label>
      </div>

      <div className="timer-actions">
        {!timer.running ? (
          <button onClick={timer.start} style={{
            ...btnPrimary, flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            borderRadius: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "13px",
          }}>
            <Icon name="play_arrow" size={18} />
            Start
          </button>
        ) : (
          <>
            <button onClick={timer.stop} style={{
              ...btnPrimary, flex: 1, background: t.rust,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              borderRadius: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "13px",
            }}>
              <Icon name="stop" size={18} />
              Stop & Save
            </button>
            <button onClick={timer.reset} title="Discard" style={{
              padding: "10px 16px", background: "transparent", border: `1px solid ${t.border}`,
              borderRadius: "12px", cursor: "pointer", color: t.textTertiary, fontFamily: t.font,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "14px",
            }}>
              <Icon name="close" size={16} />
              <span className="timer-discard-label">Discard</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

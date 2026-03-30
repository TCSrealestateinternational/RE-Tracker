import { useTimer } from "@/hooks/useTimer";
import { useClients } from "@/hooks/useClients";
import { ACTIVITY_CATEGORIES } from "@/types";
import { theme } from "@/styles/theme";

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LiveTimer() {
  const timer = useTimer();
  const { clients } = useClients();

  return (
    <div style={{
      background: theme.colors.white,
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>Live Timer</h2>

      <div style={{ fontSize: "2.5rem", fontWeight: 700, textAlign: "center", margin: "1rem 0", color: theme.colors.gray900 }}>
        {formatTime(timer.elapsed)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <label>
          <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Category</span>
          <select
            value={timer.category}
            onChange={(e) => timer.setCategory(e.target.value as typeof timer.category)}
            disabled={timer.running}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem" }}
          >
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Client (optional)</span>
          <select
            value={timer.clientId ?? ""}
            onChange={(e) => timer.setClientId(e.target.value || null)}
            disabled={timer.running}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem" }}
          >
            <option value="">None</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        <span style={{ display: "block", fontSize: "0.8rem", color: theme.colors.gray500, marginBottom: "0.25rem" }}>Note</span>
        <input
          value={timer.note}
          onChange={(e) => timer.setNote(e.target.value)}
          placeholder="What are you working on?"
          style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: `1px solid ${theme.colors.gray200}`, fontSize: "0.85rem", boxSizing: "border-box" }}
        />
      </label>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        {!timer.running ? (
          <button onClick={timer.start} style={{
            flex: 1, padding: "0.75rem", background: theme.colors.teal, color: theme.colors.white,
            border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
          }}>
            Start
          </button>
        ) : (
          <>
            <button onClick={timer.stop} style={{
              flex: 1, padding: "0.75rem", background: theme.colors.rust, color: theme.colors.white,
              border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}>
              Stop & Save
            </button>
            <button onClick={timer.reset} style={{
              padding: "0.75rem 1.25rem", background: "transparent", border: `1px solid ${theme.colors.gray300}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", color: theme.colors.gray700,
            }}>
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { LiveTimer } from "@/components/timer/LiveTimer";
import { ManualEntry } from "@/components/timer/ManualEntry";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { theme } from "@/styles/theme";
import { formatDate } from "@/utils/dates";

export function TimerPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const recent = entries.slice(0, 10);

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
        <LiveTimer />
        <ManualEntry />
      </div>

      {/* Recent entries */}
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: theme.colors.teal }}>Recent Entries</h2>
        {recent.length === 0 ? (
          <p style={{ color: theme.colors.gray500, fontSize: "0.85rem" }}>No entries yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.colors.gray200}` }}>
                <th style={{ textAlign: "left", padding: "0.5rem", color: theme.colors.gray700 }}>Date</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: theme.colors.gray700 }}>Category</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: theme.colors.gray700 }}>Client</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: theme.colors.gray700 }}>Source</th>
                <th style={{ textAlign: "right", padding: "0.5rem", color: theme.colors.gray700 }}>Duration</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: theme.colors.gray700 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => {
                const client = clients.find((c) => c.id === e.clientId);
                const hours = (e.durationMs / 3_600_000).toFixed(1);
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${theme.colors.gray100}` }}>
                    <td style={{ padding: "0.5rem", color: theme.colors.gray500 }}>{formatDate(e.startTime)}</td>
                    <td style={{ padding: "0.5rem" }}>{e.category}</td>
                    <td style={{ padding: "0.5rem", color: theme.colors.gray500 }}>{client?.name ?? "—"}</td>
                    <td style={{ padding: "0.5rem", color: theme.colors.gray500 }}>{e.leadSource || "—"}</td>
                    <td style={{ padding: "0.5rem", textAlign: "right", fontWeight: 600 }}>{hours}h</td>
                    <td style={{ padding: "0.5rem", color: theme.colors.gray500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.note || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { LiveTimer } from "@/components/timer/LiveTimer";
import { ManualEntry } from "@/components/timer/ManualEntry";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { t, card } from "@/styles/theme";
import { formatDate } from "@/utils/dates";

export function TimerPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const recent = entries.slice(0, 10);

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Timer</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
        <LiveTimer />
        <ManualEntry />
      </div>

      <div style={card}>
        <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Recent Entries</h3>
        {recent.length === 0 ? (
          <p style={{ ...t.body, color: t.textTertiary }}>
            No time entries yet. Start the timer or add a manual entry to begin tracking your hours.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Category", "Client", "Source", "Duration", "Note"].map((h) => (
                  <th key={h} style={{
                    ...t.label, color: t.textTertiary, textAlign: h === "Duration" ? "right" : "left",
                    padding: "0 12px 10px 0", borderBottom: `1px solid ${t.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => {
                const client = clients.find((c) => c.id === e.clientId);
                const hours = (e.durationMs / 3_600_000).toFixed(1);
                return (
                  <tr key={e.id}>
                    <td style={{ ...t.caption, padding: "10px 12px 10px 0", color: t.textTertiary }}>{formatDate(e.startTime)}</td>
                    <td style={{ ...t.body, padding: "10px 12px 10px 0", color: t.text }}>{e.category}</td>
                    <td style={{ ...t.caption, padding: "10px 12px 10px 0", color: t.textTertiary }}>{client?.name ?? "—"}</td>
                    <td style={{ ...t.caption, padding: "10px 12px 10px 0", color: t.textTertiary }}>{e.leadSource || "—"}</td>
                    <td style={{ ...t.body, padding: "10px 12px 10px 0", textAlign: "right", fontWeight: 600, color: t.teal }}>{hours}h</td>
                    <td style={{
                      ...t.caption, padding: "10px 0", color: t.textTertiary,
                      maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
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

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { LiveTimer } from "@/components/timer/LiveTimer";
import { ManualEntry } from "@/components/timer/ManualEntry";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { t, card } from "@/styles/theme";
import { formatDate, formatHours } from "@/utils/dates";
import type { TimeEntry } from "@/types";

export function TimerPage() {
  const { entries, deleteTimeEntry } = useTimeEntries();
  const { clients } = useClients();
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const recent = entries.slice(0, 10);

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Timer</h1>

      {editing ? (
        <ManualEntry
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      ) : (
        <div className="grid-2col" style={{ alignItems: "start" }}>
          <LiveTimer />
          <ManualEntry />
        </div>
      )}

      <div style={card}>
        <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Recent Entries</h3>
        {recent.length === 0 ? (
          <p style={{ ...t.body, color: t.textTertiary }}>
            No time entries yet. Start the timer or add a manual entry to begin tracking your hours.
          </p>
        ) : (
          <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                {["Date", "Category", "Client", "Source", "Duration", "Note", ""].map((h) => (
                  <th key={h || "_actions"} style={{
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
                return (
                  <tr
                    key={e.id}
                    onClick={() => setEditing(e)}
                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = t.surfaceHover)}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}
                  >
                    <td style={{ ...t.caption, padding: "10px 12px 10px 0", color: t.textTertiary }}>{formatDate(e.startTime)}</td>
                    <td style={{ ...t.body, padding: "10px 12px 10px 0", color: t.text }}>{e.category}</td>
                    <td style={{ ...t.caption, padding: "10px 12px 10px 0", color: t.textTertiary }}>{client?.name ?? "—"}</td>
                    <td style={{ ...t.caption, padding: "10px 12px 10px 0", color: t.textTertiary }}>{e.leadSource || "—"}</td>
                    <td style={{ ...t.body, padding: "10px 12px 10px 0", textAlign: "right", fontWeight: 600, color: t.teal }}>{formatHours(e.durationMs)}</td>
                    <td style={{
                      ...t.caption, padding: "10px 0", color: t.textTertiary,
                      maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {e.note || "—"}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "center", width: "40px" }}>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); deleteTimeEntry(e.id); }}
                        title="Delete entry"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: t.textTertiary, padding: "4px", borderRadius: "4px",
                          display: "inline-flex", alignItems: "center",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.color = t.rust)}
                        onMouseLeave={(ev) => (ev.currentTarget.style.color = t.textTertiary)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

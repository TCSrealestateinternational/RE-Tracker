import { LEAD_SOURCES, type TimeEntry, type Deal } from "@/types";
import { t, card } from "@/styles/theme";

interface LeadSourceReportProps {
  entries: TimeEntry[];
  deals: Deal[];
}

export function LeadSourceReport({ entries, deals }: LeadSourceReportProps) {
  const closedDeals = deals.filter((d) => d.stage === "Closed");

  const data = LEAD_SOURCES.map((source) => {
    const sourceEntries = entries.filter((e) => e.leadSource === source);
    const hours = sourceEntries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    const commission = closedDeals.filter((d) => d.leadSource === source).reduce((s, d) => s + d.projectedCommission, 0);
    const rph = hours > 0 ? commission / hours : 0;
    return { source, hours, commission, rph };
  }).filter((d) => d.hours > 0 || d.commission > 0);

  if (data.length === 0) {
    return (
      <div style={card}>
        <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>Lead Source ROI</h3>
        <p style={{ ...t.body, color: t.textTertiary }}>
          Tag your time entries and deals with lead sources to see which activities give the best return on your time.
        </p>
      </div>
    );
  }

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>Lead Source ROI</h3>
      <div className="table-scroll">
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "400px" }}>
        <thead>
          <tr>
            {["Source", "Hours", "Commission", "$/Hour"].map((h, i) => (
              <th key={h} style={{
                ...t.label, color: t.textTertiary, textAlign: i > 0 ? "right" : "left",
                padding: "0 12px 10px 0", borderBottom: `1px solid ${t.border}`,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.source}>
              <td style={{ ...t.body, padding: "10px 12px 10px 0", color: t.text }}>{d.source}</td>
              <td style={{ ...t.body, padding: "10px 12px 10px 0", textAlign: "right", color: t.teal }}>{d.hours.toFixed(1)}</td>
              <td style={{ ...t.body, padding: "10px 12px 10px 0", textAlign: "right", color: t.gold }}>
                ${d.commission.toLocaleString()}
              </td>
              <td style={{
                ...t.body, padding: "10px 0", textAlign: "right", fontWeight: 600,
                color: d.rph > 0 ? t.success : t.textTertiary,
              }}>
                ${d.rph.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function getLeadSourceReportData(entries: TimeEntry[], deals: Deal[]) {
  const closedDeals = deals.filter((d) => d.stage === "Closed");
  const headers = ["Source", "Hours", "Commission", "$/Hour"];
  const rows = LEAD_SOURCES.map((source) => {
    const hours = entries.filter((e) => e.leadSource === source).reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    const commission = closedDeals.filter((d) => d.leadSource === source).reduce((s, d) => s + d.projectedCommission, 0);
    const rph = hours > 0 ? commission / hours : 0;
    return [source, hours.toFixed(1), `$${commission.toLocaleString()}`, `$${rph.toFixed(0)}`];
  }).filter((_, i) => {
    const src = LEAD_SOURCES[i]!;
    return entries.some((e) => e.leadSource === src) || closedDeals.some((d) => d.leadSource === src);
  });
  return { headers, rows };
}

import { LEAD_SOURCES, type TimeEntry, type Deal } from "@/types";
import { theme } from "@/styles/theme";

interface LeadSourceReportProps {
  entries: TimeEntry[];
  deals: Deal[];
}

export function LeadSourceReport({ entries, deals }: LeadSourceReportProps) {
  const closedDeals = deals.filter((d) => d.stage === "Closed");

  const data = LEAD_SOURCES.map((source) => {
    const sourceEntries = entries.filter((e) => e.leadSource === source);
    const hours = sourceEntries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    const commission = closedDeals
      .filter((d) => d.leadSource === source)
      .reduce((s, d) => s + d.projectedCommission, 0);
    const rph = hours > 0 ? commission / hours : 0;
    return { source, hours, commission, rph };
  }).filter((d) => d.hours > 0 || d.commission > 0);

  if (data.length === 0) {
    return (
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "0.5rem" }}>
          Lead Source Breakdown
        </h3>
        <p style={{ color: theme.colors.gray500, fontSize: "0.85rem" }}>
          Tag time entries and deals with lead sources to see ROI by source.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "1rem" }}>
        Lead Source: Hours Invested vs Commission Returned
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${theme.colors.gray200}` }}>
            <th style={{ textAlign: "left", padding: "0.5rem", color: theme.colors.gray700 }}>Source</th>
            <th style={{ textAlign: "right", padding: "0.5rem", color: theme.colors.gray700 }}>Hours</th>
            <th style={{ textAlign: "right", padding: "0.5rem", color: theme.colors.gray700 }}>Commission</th>
            <th style={{ textAlign: "right", padding: "0.5rem", color: theme.colors.gray700 }}>$/Hour</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.source} style={{ borderBottom: `1px solid ${theme.colors.gray100}` }}>
              <td style={{ padding: "0.5rem", color: theme.colors.gray900 }}>{d.source}</td>
              <td style={{ padding: "0.5rem", textAlign: "right", color: theme.colors.teal }}>{d.hours.toFixed(1)}</td>
              <td style={{ padding: "0.5rem", textAlign: "right", color: theme.colors.gold }}>
                ${d.commission.toLocaleString()}
              </td>
              <td style={{
                padding: "0.5rem", textAlign: "right", fontWeight: 600,
                color: d.rph > 0 ? "#10b981" : theme.colors.gray500,
              }}>
                ${d.rph.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    const has = entries.some((e) => e.leadSource === src) || closedDeals.some((d) => d.leadSource === src);
    return has;
  });
  return { headers, rows };
}

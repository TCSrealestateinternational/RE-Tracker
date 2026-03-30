import { t, card } from "@/styles/theme";
import type { Deal } from "@/types";

interface GCIReportProps {
  deals: Deal[];
}

export function GCIReport({ deals }: GCIReportProps) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  const data = months.map((m) => {
    const monthDeals = deals.filter((d) => {
      if (d.stage !== "Closed") return false;
      const cd = new Date(d.expectedCloseDate);
      return cd.getFullYear() === m.year && cd.getMonth() === m.month;
    });
    return { ...m, total: monthDeals.reduce((s, d) => s + d.projectedCommission, 0) };
  });

  const maxGCI = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={card}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
        GCI by Month
      </h3>
      <div style={{ display: "grid", gap: "10px" }}>
        {data.map((m) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "50px", ...t.caption, color: t.textTertiary }}>{m.label}</span>
            <div style={{ flex: 1, height: "4px", background: t.goldLight, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(m.total / maxGCI) * 100}%`,
                background: t.gold, borderRadius: "2px",
              }} />
            </div>
            <span style={{ width: "60px", textAlign: "right", ...t.caption, color: t.textSecondary, fontWeight: 600 }}>
              ${m.total.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function getGCIReportData(deals: Deal[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });
  const headers = ["Month", "GCI"];
  const rows = months.map((m) => {
    const total = deals
      .filter((d) => {
        if (d.stage !== "Closed") return false;
        const cd = new Date(d.expectedCloseDate);
        return cd.getFullYear() === m.year && cd.getMonth() === m.month;
      })
      .reduce((s, d) => s + d.projectedCommission, 0);
    return [m.label, `$${total.toLocaleString()}`];
  });
  return { headers, rows };
}

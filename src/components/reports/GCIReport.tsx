import { theme } from "@/styles/theme";
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
    const total = monthDeals.reduce((s, d) => s + d.projectedCommission, 0);
    return { ...m, total };
  });

  const maxGCI = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "1rem" }}>
        GCI by Month (Last 12 Months)
      </h3>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {data.map((m) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "50px", fontSize: "0.7rem", color: theme.colors.gray500 }}>{m.label}</span>
            <div style={{ flex: 1, height: "14px", background: theme.colors.gray100, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(m.total / maxGCI) * 100}%`,
                background: theme.colors.gold, borderRadius: "4px",
              }} />
            </div>
            <span style={{ width: "60px", fontSize: "0.7rem", color: theme.colors.gray700, textAlign: "right" }}>
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

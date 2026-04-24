import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import type { Client, TimeEntry } from "@/types";
import { getWeekStart, getWeekLabel } from "@/utils/dates";

interface RevenuePerHourReportProps {
  clients: Client[];
  entries: TimeEntry[];
}

export function RevenuePerHourReport({ clients, entries }: RevenuePerHourReportProps) {
  const weeks: { label: string; start: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeks.push({ label: getWeekLabel(getWeekStart(d)), start: getWeekStart(d) });
  }

  const totalGCI = clients.reduce((s, c) => s + c.commissionEarned, 0);

  const data = weeks.map((w) => {
    const weekEnd = w.start + 7 * 24 * 60 * 60 * 1000;
    const weekEntries = entries.filter((e) => e.startTime >= w.start && e.startTime < weekEnd);
    const hours = weekEntries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
    return { ...w, hours };
  });

  const totalHours = entries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
  const overallRPH = totalHours > 0 ? totalGCI / totalHours : 0;

  // Per-client breakdown: hours, commission, $/hr
  const clientBreakdown = clients
    .filter((c) => c.commissionEarned > 0 || entries.some((e) => e.clientId === c.id))
    .map((c) => {
      const clientEntries = entries.filter((e) => e.clientId === c.id);
      const hours = clientEntries.reduce((s, e) => s + e.durationMs, 0) / 3_600_000;
      const rph = hours > 0 ? c.commissionEarned / hours : 0;
      return { name: c.name, hours, commission: c.commissionEarned, rph, stage: c.stage };
    })
    .sort((a, b) => b.rph - a.rph);

  const maxRPH = Math.max(...clientBreakdown.map((c) => c.rph), 1);

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={card}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Revenue Per Hour</h3>
          <span style={{ ...t.stat, fontSize: "20px", color: t.teal }}>
            ${overallRPH.toFixed(0)}/hr overall
          </span>
        </div>
        <div style={{ display: "grid", gap: "10px" }}>
          {data.map((w) => (
            <div key={w.start} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "50px", ...t.caption, color: t.textTertiary }}>{w.label}</span>
              <div style={{ flex: 1, height: "4px", background: t.tealLight, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min((w.hours / 40) * 100, 100)}%`,
                  background: t.teal, borderRadius: "2px",
                }} />
              </div>
              <span style={{ width: "40px", textAlign: "right", ...t.caption, color: t.textSecondary, fontWeight: 600 }}>
                {w.hours.toFixed(1)}h
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Client $/hr Breakdown */}
      {clientBreakdown.length > 0 && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <Icon name="people" size={18} color={t.teal} />
            <h3 style={{ ...t.sectionHeader, color: t.text }}>$/Hour by Client</h3>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {clientBreakdown.map((c) => (
              <div key={c.name} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", background: t.bg, borderRadius: "8px",
              }}>
                <div style={{ flex: "0 0 140px", minWidth: 0 }}>
                  <div style={{ ...t.body, color: t.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.name}
                  </div>
                  <div style={{ ...t.caption, color: t.textTertiary, textTransform: "capitalize" }}>
                    {c.stage}
                  </div>
                </div>
                <div style={{ flex: 1, height: "6px", background: t.tealLight, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min((c.rph / maxRPH) * 100, 100)}%`,
                    background: c.rph > 0 ? t.teal : t.textTertiary,
                    borderRadius: "3px",
                    transition: "width 0.3s",
                  }} />
                </div>
                <div style={{ flex: "0 0 160px", display: "flex", gap: "12px", justifyContent: "flex-end", textAlign: "right" }}>
                  <div>
                    <div style={{ ...t.caption, color: t.textSecondary, fontWeight: 600 }}>{c.hours.toFixed(1)}h</div>
                  </div>
                  <div>
                    <div style={{ ...t.caption, color: t.gold, fontWeight: 600 }}>${c.commission.toLocaleString()}</div>
                  </div>
                  <div style={{ minWidth: "55px" }}>
                    <div style={{ ...t.caption, color: t.teal, fontWeight: 700 }}>
                      {c.hours > 0 ? `$${c.rph.toFixed(0)}/hr` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

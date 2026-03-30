import { DollarSign, Clock, TrendingUp } from "lucide-react";
import { t, card } from "@/styles/theme";
import type { Client, TimeEntry } from "@/types";

interface RevenueStatsProps {
  clients: Client[];
  entries: TimeEntry[];
}

export function RevenueStats({ clients, entries }: RevenueStatsProps) {
  const totalGCI = clients.reduce((s, c) => s + c.commissionEarned, 0);
  const totalMs = entries.reduce((s, e) => s + e.durationMs, 0);
  const totalHours = totalMs / 3_600_000;
  const revenuePerHour = totalHours > 0 ? totalGCI / totalHours : 0;

  const stats = [
    { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, color: t.teal, icon: Clock },
    { label: "Total GCI", value: `$${totalGCI.toLocaleString()}`, color: t.gold, icon: DollarSign },
    { label: "Revenue / Hour", value: `$${revenuePerHour.toFixed(0)}`, color: t.teal, icon: TrendingUp },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
      {stats.map(({ label, value, color, icon: Icon }) => (
        <div key={label} style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
          <Icon size={16} color={color} strokeWidth={1.5} />
          <div>
            <div style={{ ...t.stat, color, fontSize: "24px" }}>{value}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

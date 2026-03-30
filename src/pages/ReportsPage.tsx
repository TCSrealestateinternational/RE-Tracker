import { useState } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { HoursReport, getHoursReportData } from "@/components/reports/HoursReport";
import { GCIReport, getGCIReportData } from "@/components/reports/GCIReport";
import { RevenuePerHourReport } from "@/components/reports/RevenuePerHourReport";
import { LeadSourceReport, getLeadSourceReportData } from "@/components/reports/LeadSourceReport";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { theme } from "@/styles/theme";

type ReportTab = "hours" | "gci" | "rph" | "leadsource";

export function ReportsPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const { deals } = useDeals();
  const [tab, setTab] = useState<ReportTab>("hours");

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "hours", label: "Hours by Week" },
    { key: "gci", label: "GCI by Month" },
    { key: "rph", label: "Revenue/Hour" },
    { key: "leadsource", label: "Lead Source ROI" },
  ];

  function getExportData() {
    switch (tab) {
      case "hours": return { ...getHoursReportData(entries), title: "Hours by Week", file: "hours-report" };
      case "gci": return { ...getGCIReportData(deals), title: "GCI by Month", file: "gci-report" };
      case "leadsource": return { ...getLeadSourceReportData(entries, deals), title: "Lead Source ROI", file: "lead-source-report" };
      default: return null;
    }
  }

  const exportData = getExportData();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: theme.colors.teal }}>Reports</h2>
        {exportData && (
          <ExportButtons
            title={exportData.title}
            headers={exportData.headers}
            rows={exportData.rows}
            filenameBase={exportData.file}
          />
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "0.5rem 1rem", border: "none", borderRadius: "8px",
              background: tab === t.key ? theme.colors.teal : theme.colors.gray100,
              color: tab === t.key ? theme.colors.white : theme.colors.gray700,
              fontWeight: tab === t.key ? 600 : 400,
              fontSize: "0.85rem", cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hours" && <HoursReport entries={entries} />}
      {tab === "gci" && <GCIReport deals={deals} />}
      {tab === "rph" && <RevenuePerHourReport clients={clients} entries={entries} />}
      {tab === "leadsource" && <LeadSourceReport entries={entries} deals={deals} />}
    </div>
  );
}

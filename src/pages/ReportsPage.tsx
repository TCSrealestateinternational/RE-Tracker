import { useState } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { HoursReport, getHoursReportData } from "@/components/reports/HoursReport";
import { GCIReport, getGCIReportData } from "@/components/reports/GCIReport";
import { RevenuePerHourReport } from "@/components/reports/RevenuePerHourReport";
import { LeadSourceReport, getLeadSourceReportData } from "@/components/reports/LeadSourceReport";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { t } from "@/styles/theme";

type ReportTab = "hours" | "gci" | "rph" | "leadsource";

export function ReportsPage() {
  const { entries } = useTimeEntries();
  const { clients } = useClients();
  const { deals } = useDeals();
  const [tab, setTab] = useState<ReportTab>("hours");

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "hours", label: "Hours" },
    { key: "gci", label: "GCI" },
    { key: "rph", label: "Revenue/Hour" },
    { key: "leadsource", label: "Lead Source" },
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
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ ...t.pageTitle, color: t.text }}>Reports</h1>
        {exportData && (
          <div data-tour="export-buttons">
            <ExportButtons title={exportData.title} headers={exportData.headers} rows={exportData.rows} filenameBase={exportData.file} />
          </div>
        )}
      </div>

      <div data-tour="report-tabs" className="tab-row" style={{ display: "flex", gap: "4px" }}>
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            style={{
              padding: "8px 16px", border: "none", borderRadius: "8px",
              background: tab === item.key ? t.teal : "transparent",
              color: tab === item.key ? t.textInverse : t.textSecondary,
              fontWeight: tab === item.key ? 600 : 400,
              fontSize: "14px", cursor: "pointer", fontFamily: t.font,
              transition: "background 0.12s, color 0.12s",
            }}
          >
            {item.label}
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

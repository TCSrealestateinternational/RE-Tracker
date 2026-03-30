import { Download } from "lucide-react";
import { exportCSV, exportPDF } from "@/utils/export";
import { t } from "@/styles/theme";

interface ExportButtonsProps {
  title: string;
  headers: string[];
  rows: string[][];
  filenameBase: string;
}

export function ExportButtons({ title, headers, rows, filenameBase }: ExportButtonsProps) {
  const btnStyle = {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: t.font,
    background: "transparent",
    color: t.textSecondary,
    border: `1px solid ${t.border}`,
    borderRadius: "6px",
    cursor: "pointer" as const,
  };

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button onClick={() => exportCSV(headers, rows, `${filenameBase}.csv`)} style={btnStyle}>
        <Download size={14} strokeWidth={1.5} />
        CSV
      </button>
      <button onClick={() => exportPDF(title, headers, rows)} style={btnStyle}>
        <Download size={14} strokeWidth={1.5} />
        PDF
      </button>
    </div>
  );
}

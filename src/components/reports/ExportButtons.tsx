import { exportCSV, exportPDF } from "@/utils/export";
import { theme } from "@/styles/theme";

interface ExportButtonsProps {
  title: string;
  headers: string[];
  rows: string[][];
  filenameBase: string;
}

export function ExportButtons({ title, headers, rows, filenameBase }: ExportButtonsProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        onClick={() => exportCSV(headers, rows, `${filenameBase}.csv`)}
        style={{
          padding: "0.4rem 0.75rem", fontSize: "0.75rem", fontWeight: 600,
          background: theme.colors.gray100, color: theme.colors.gray700,
          border: `1px solid ${theme.colors.gray200}`, borderRadius: "6px", cursor: "pointer",
        }}
      >
        Export CSV
      </button>
      <button
        onClick={() => exportPDF(title, headers, rows)}
        style={{
          padding: "0.4rem 0.75rem", fontSize: "0.75rem", fontWeight: 600,
          background: theme.colors.gray100, color: theme.colors.gray700,
          border: `1px solid ${theme.colors.gray200}`, borderRadius: "6px", cursor: "pointer",
        }}
      >
        Export PDF
      </button>
    </div>
  );
}

// ── CSV Export ──
export function exportCSV(headers: string[], rows: string[][], filename: string) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

// ── PDF Export (simple HTML-to-print approach, no library needed) ──
export function exportPDF(title: string, headers: string[], rows: string[][]) {
  const tableRows = rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td style="padding:4px 8px;border:1px solid #ddd">${c}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `
    <html><head><title>${title}</title>
    <style>
      body { font-family: 'Manrope', Arial, sans-serif; padding: 20px; }
      h1 { color: #0c414e; font-size: 18px; }
      table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 13px; }
      th { background: #0c414e; color: white; padding: 6px 8px; text-align: left; }
      td { padding: 4px 8px; border: 1px solid #ddd; }
      tr:nth-child(even) { background: #f9fafb; }
    </style></head><body>
    <h1>${title}</h1>
    <table>
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    </body></html>
  `;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.print();
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

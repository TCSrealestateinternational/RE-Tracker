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
      h1 { color: #4f6c4b; font-size: 18px; }
      table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 13px; }
      th { background: #4f6c4b; color: white; padding: 6px 8px; text-align: left; }
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

// ── Client Detail PDF ──
import type { Client } from "@/types";

function fmtDollars(n: number): string {
  if (!n) return "$0";
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function exportClientPDF(client: Client) {
  const isBuyer = client.status === "buyer";

  const row = (label: string, value: string | null | undefined) =>
    value ? `<tr><td style="padding:6px 10px;color:#6b7280;width:40%">${label}</td><td style="padding:6px 10px;font-weight:500">${value}</td></tr>` : "";

  const contactRows = [
    row("Name", client.name),
    row("Email", client.email),
    row("Phone", client.phone),
    row("Lead Source", client.leadSource || null),
    row("Stage", client.stage),
    row("Follow-Up", client.followUpDate),
    ...(client.additionalContacts || []).map((c, i) =>
      row(`Contact ${i + 2}`, [c.name, c.email, c.phone].filter(Boolean).join(" — "))
    ),
  ].join("");

  const commissionMode = client.commissionMode === "flat"
    ? fmtDollars(client.commissionFlat)
    : `${client.commissionPercent}%`;

  const financialRows = [
    row("Commission Mode", commissionMode),
    row("Commission Earned", fmtDollars(client.commissionEarned)),
  ].join("");

  let transactionRows = "";
  if (isBuyer) {
    transactionRows = [
      row("Lender", client.lenderName || null),
      row("Pre-Approval", client.preApprovalAmount ? fmtDollars(client.preApprovalAmount) : null),
      row("Price Range", (client.priceRange?.min || client.priceRange?.max) ? `${fmtDollars(client.priceRange.min)} – ${fmtDollars(client.priceRange.max)}` : null),
      row("Search Criteria", client.searchCriteria || null),
      row("Date Under Contract", client.dateUnderContract),
      row("Projected Close Date", client.projectedCloseDate),
    ].join("");
  } else {
    transactionRows = [
      row("Property Address", client.propertyAddress || null),
      row("List Price", client.listPrice ? fmtDollars(client.listPrice) : null),
      ...(client.priceReductions?.length ? [row("Price Reductions", client.priceReductions.map((r) => `−${fmtDollars(r)}`).join(", "))] : []),
      ...(client.offers?.length ? [row("Offers", client.offers.map((o) => `${fmtDollars(o.amount)} (${o.status})`).join(", "))] : []),
      row("Accepted Offer Date", client.acceptedOfferDate),
      row("Expected Close Date", client.expectedCloseDate),
    ].join("");
  }

  const driveLinksHtml = client.driveLinks?.length
    ? `<h2 style="color:#4f6c4b;font-size:15px;margin-top:24px">Google Drive Links</h2>
       <ul style="padding-left:20px;font-size:13px">${client.driveLinks.map((l) => `<li><a href="${l.url}">${l.label || l.url}</a></li>`).join("")}</ul>`
    : "";

  const notesHtml = client.notes
    ? `<h2 style="color:#4f6c4b;font-size:15px;margin-top:24px">Notes</h2>
       <p style="font-size:13px;white-space:pre-wrap">${client.notes}</p>`
    : "";

  const section = (title: string, rows: string) =>
    rows.trim() ? `<h2 style="color:#4f6c4b;font-size:15px;margin-top:24px">${title}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e5e7eb;border-radius:6px"><tbody>${rows}</tbody></table>` : "";

  const html = `<html><head><title>${client.name} — RE Tracker</title>
  <style>
    body { font-family: 'Manrope', Arial, sans-serif; padding: 28px; color: #393831; max-width: 700px; margin: 0 auto; }
    h1 { color: #4f6c4b; font-size: 20px; margin-bottom: 2px; }
    h2 { margin-bottom: 8px; }
    table { border-radius: 6px; overflow: hidden; }
    tr:nth-child(even) { background: #f9fafb; }
    td { border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .buyer { background: rgba(79,108,75,0.1); color: #4f6c4b; }
    .seller { background: rgba(110,99,83,0.12); color: #6e6353; }
    @media print { body { padding: 0; } }
  </style></head><body>
  <h1>${client.name}</h1>
  <span class="badge ${isBuyer ? "buyer" : "seller"}">${client.status}</span>
  <span style="font-size:12px;color:#9ca3af;margin-left:8px">Exported ${new Date().toLocaleDateString()}</span>
  ${section("Contact Information", contactRows)}
  ${section(isBuyer ? "Buyer Details" : "Listing Details", transactionRows)}
  ${section("Commission", financialRows)}
  ${notesHtml}
  ${driveLinksHtml}
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

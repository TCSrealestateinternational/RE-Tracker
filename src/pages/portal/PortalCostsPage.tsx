import { usePortalData } from "@/hooks/portal/usePortalData";
import { t, card } from "@/styles/theme";
import { DollarSign } from "lucide-react";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function PortalCostsPage() {
  const { costBreakdown, loading } = usePortalData();

  if (loading) {
    return <p style={{ ...t.body, color: t.textTertiary, padding: "40px", textAlign: "center" }}>Loading...</p>;
  }

  if (!costBreakdown) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
        <DollarSign size={36} color={t.textTertiary} style={{ marginBottom: "12px" }} />
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>Cost Breakdown Coming Soon</h2>
        <p style={{ ...t.body, color: t.textSecondary }}>
          Your agent hasn't set up a cost estimate yet. Once they do, you'll see a full breakdown of expected costs here.
        </p>
      </div>
    );
  }

  const price = costBreakdown.purchasePrice;
  const totalCosts = costBreakdown.items.reduce((sum, item) => sum + item.amount, 0);
  const isSeller = costBreakdown.type === "seller";
  const netAmount = isSeller ? price - totalCosts : price + totalCosts;

  return (
    <div>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: t.sectionGap }}>
        Estimated Cost Breakdown
      </h1>

      {/* Summary card */}
      <div className="grid-3col" style={{ marginBottom: "20px" }}>
        <div style={{ ...card, textAlign: "center" }}>
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "8px" }}>
            {isSeller ? "Sale Price" : "Purchase Price"}
          </span>
          <span style={{ ...t.stat, color: t.teal }}>{fmt(price)}</span>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "8px" }}>
            Total Costs
          </span>
          <span style={{ ...t.stat, color: t.rust }}>{fmt(totalCosts)}</span>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "8px" }}>
            {isSeller ? "Est. Net Proceeds" : "Est. Total Cost"}
          </span>
          <span style={{ ...t.stat, color: isSeller ? t.success : t.text }}>{fmt(netAmount)}</span>
        </div>
      </div>

      {/* Line items */}
      <div style={{ ...card }}>
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
          Cost Details
        </h2>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...t.label, color: t.textTertiary, textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${t.border}` }}>Item</th>
                <th style={{ ...t.label, color: t.textTertiary, textAlign: "right", padding: "8px 12px", borderBottom: `1px solid ${t.border}` }}>Amount</th>
                <th style={{ ...t.label, color: t.textTertiary, textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${t.border}` }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {costBreakdown.items.map((item, i) => (
                <tr key={i}>
                  <td style={{ ...t.body, color: t.text, padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                    {item.label}
                  </td>
                  <td style={{ ...t.body, color: t.rust, fontWeight: 600, textAlign: "right", padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                    {fmt(item.amount)}
                  </td>
                  <td style={{ ...t.body, color: t.textTertiary, padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                    {item.note || "—"}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr>
                <td style={{ ...t.body, fontWeight: 700, color: t.text, padding: "12px" }}>Total</td>
                <td style={{ ...t.body, fontWeight: 700, color: t.rust, textAlign: "right", padding: "12px" }}>{fmt(totalCosts)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...t.caption, color: t.textTertiary, marginTop: "16px", textAlign: "center" }}>
        These are estimates and may change before closing. Your agent will keep this updated as details are finalized.
      </p>
    </div>
  );
}

import { usePortalData } from "@/hooks/portal/usePortalData";
import { t, card } from "@/styles/theme";
import { TrendingUp, Home, Calendar, DollarSign } from "lucide-react";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function PortalMarketPage() {
  const { client, marketData, loading } = usePortalData();

  if (loading) {
    return <p style={{ ...t.body, color: t.textTertiary, padding: "40px", textAlign: "center" }}>Loading...</p>;
  }

  if (!marketData) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
        <TrendingUp size={36} color={t.textTertiary} style={{ marginBottom: "12px" }} />
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>Market Data Coming Soon</h2>
        <p style={{ ...t.body, color: t.textSecondary }}>
          Your agent will add local market data here to help you understand how your property compares to the market.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "8px" }}>
        Market Dashboard
      </h1>
      <p style={{ ...t.body, color: t.textSecondary, marginBottom: t.sectionGap }}>
        {client?.propertyAddress ? `Market data for the area around ${client.propertyAddress}` : "Local market overview"}
      </p>

      {/* Stats grid */}
      <div className="grid-4col" style={{ marginBottom: "20px" }}>
        <div style={{ ...card, textAlign: "center" }}>
          <Calendar size={20} color={t.teal} style={{ marginBottom: "8px" }} />
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "6px" }}>
            Avg Days on Market
          </span>
          <span style={{ ...t.stat, color: t.text }}>{marketData.avgDaysOnMarket}</span>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <DollarSign size={20} color={t.teal} style={{ marginBottom: "8px" }} />
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "6px" }}>
            Median Price
          </span>
          <span style={{ ...t.stat, color: t.text, fontSize: "22px" }}>{fmt(marketData.medianPrice)}</span>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <Home size={20} color={t.teal} style={{ marginBottom: "8px" }} />
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "6px" }}>
            Inventory
          </span>
          <span style={{ ...t.stat, color: t.text, fontSize: "22px" }}>{marketData.inventoryLevel}</span>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <TrendingUp size={20} color={t.teal} style={{ marginBottom: "8px" }} />
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "6px" }}>
            Price / Sq Ft
          </span>
          <span style={{ ...t.stat, color: t.text, fontSize: "22px" }}>{fmt(marketData.pricePerSqft)}</span>
        </div>
      </div>

      {/* Comparable sales */}
      {marketData.comps.length > 0 && (
        <div style={{ ...card, marginBottom: "20px" }}>
          <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "16px" }}>
            Comparable Sales
          </h2>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Address", "Sold Price", "Date", "Sq Ft", "Beds", "Baths"].map((h) => (
                    <th key={h} style={{
                      ...t.label,
                      color: t.textTertiary,
                      textAlign: h === "Address" ? "left" : "right",
                      padding: "8px 12px",
                      borderBottom: `1px solid ${t.border}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marketData.comps.map((comp, i) => (
                  <tr key={i}>
                    <td style={{ ...t.body, color: t.text, padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                      {comp.address}
                    </td>
                    <td style={{ ...t.body, color: t.success, fontWeight: 600, textAlign: "right", padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                      {fmt(comp.soldPrice)}
                    </td>
                    <td style={{ ...t.body, color: t.textSecondary, textAlign: "right", padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                      {comp.soldDate}
                    </td>
                    <td style={{ ...t.body, color: t.textSecondary, textAlign: "right", padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                      {comp.sqft.toLocaleString()}
                    </td>
                    <td style={{ ...t.body, color: t.textSecondary, textAlign: "right", padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                      {comp.beds}
                    </td>
                    <td style={{ ...t.body, color: t.textSecondary, textAlign: "right", padding: "10px 12px", borderBottom: `1px solid ${t.border}` }}>
                      {comp.baths}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agent notes */}
      {marketData.agentNotes && (
        <div style={{ ...card }}>
          <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>
            Agent's Market Notes
          </h2>
          <p style={{ ...t.body, color: t.textSecondary, whiteSpace: "pre-wrap" }}>
            {marketData.agentNotes}
          </p>
        </div>
      )}
    </div>
  );
}

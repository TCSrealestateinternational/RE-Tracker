import { useState } from "react";
import { Search } from "lucide-react";
import { t, card, inputBase } from "@/styles/theme";

const GLOSSARY: { term: string; definition: string; category: string }[] = [
  // Process
  { term: "Listing Agreement", definition: "A contract between you and your agent that gives them permission to market and sell your home. It spells out the commission, how long they'll represent you, and what they'll do to sell it.", category: "Process" },
  { term: "MLS (Multiple Listing Service)", definition: "A shared database where agents post homes for sale. When your home goes on the MLS, it also gets pushed to Zillow, Realtor.com, and other websites automatically.", category: "Process" },
  { term: "Showing", definition: "When a potential buyer (or their agent) comes to tour your home. You'll usually need to leave the house during showings.", category: "Process" },
  { term: "Open House", definition: "A scheduled window (usually a few hours on a weekend) where anyone can walk in and tour the home without an appointment.", category: "Process" },
  { term: "Under Contract", definition: "You've accepted an offer and both sides have signed. The home is no longer available to other buyers, but the sale isn't final yet — inspections and financing still need to clear.", category: "Process" },
  { term: "Closing", definition: "The final step. Everyone signs paperwork, money changes hands, and ownership transfers. You hand over the keys and walk away with your proceeds.", category: "Process" },
  { term: "Contingency", definition: "A condition in the contract that must be met before the sale is final. Common ones include the home inspection, the appraisal, and the buyer getting approved for their loan.", category: "Process" },
  { term: "Due Diligence Period", definition: "A window of time (usually 7–14 days) after going under contract where the buyer can do inspections and investigate the property. They can usually back out during this time.", category: "Process" },
  { term: "Final Walk-Through", definition: "The buyer's last chance to see the home before closing — usually the day before or the morning of. They're checking that everything is in the condition promised.", category: "Process" },

  // Money
  { term: "Earnest Money", definition: "A deposit the buyer puts down to show they're serious about buying. It's usually 1–3% of the purchase price and goes toward their down payment at closing.", category: "Money" },
  { term: "Down Payment", definition: "The chunk of cash the buyer pays upfront. It's a percentage of the purchase price — commonly 3% to 20%. The rest comes from their mortgage.", category: "Money" },
  { term: "Commission", definition: "The fee paid to real estate agents, typically 5–6% of the sale price, split between the buyer's and seller's agents. As a seller, this comes out of your proceeds.", category: "Money" },
  { term: "Closing Costs", definition: "Fees on top of the purchase price — things like title insurance, recording fees, attorney fees, and lender charges. Usually 2–5% of the price for buyers, 1–3% for sellers.", category: "Money" },
  { term: "Net Proceeds", definition: "What you actually take home after selling. It's the sale price minus the mortgage payoff, agent commission, closing costs, and any repair credits.", category: "Money" },
  { term: "Pre-Approval", definition: "A letter from a lender saying the buyer qualifies for a certain mortgage amount. Sellers like to see this — it means the buyer can actually afford the home.", category: "Money" },
  { term: "Escrow", definition: "A neutral third party (or account) that holds money and documents until the deal closes. Think of it as a trusted middleman making sure everyone does their part.", category: "Money" },
  { term: "Proration", definition: "Splitting costs like property taxes or HOA dues between buyer and seller based on the closing date. If you've prepaid taxes for the year, the buyer reimburses you for their portion.", category: "Money" },
  { term: "Seller Concession", definition: "When the seller agrees to pay some of the buyer's closing costs. It's often used as a negotiation tool — the buyer pays full price but gets help with fees.", category: "Money" },

  // Inspections & Appraisals
  { term: "Home Inspection", definition: "A professional check of the home's condition — roof, plumbing, electrical, foundation, etc. The buyer pays for it. If issues come up, they may ask you to fix things or lower the price.", category: "Inspections" },
  { term: "Appraisal", definition: "An independent valuation of the home ordered by the buyer's lender. If the appraisal comes in lower than the agreed price, the buyer, seller, or both need to figure out how to bridge the gap.", category: "Inspections" },
  { term: "CMA (Comparative Market Analysis)", definition: "A report your agent puts together showing what similar homes in your area have sold for recently. It helps determine a competitive listing price.", category: "Inspections" },
  { term: "Title Search", definition: "A check of public records to make sure the seller actually owns the property free and clear — no surprise liens, unpaid taxes, or ownership disputes.", category: "Inspections" },
  { term: "Title Insurance", definition: "Insurance that protects against problems with the property's ownership history that didn't show up in the title search. The buyer's lender usually requires it.", category: "Inspections" },
  { term: "Survey", definition: "A professional measurement of the property's boundaries. It shows exactly where the property lines are and can reveal encroachments or easements.", category: "Inspections" },

  // Documents
  { term: "Purchase Agreement", definition: "The main contract between buyer and seller. It includes the price, closing date, contingencies, and everything both sides have agreed to.", category: "Documents" },
  { term: "Closing Disclosure", definition: "A document you receive 3 days before closing that shows every dollar — purchase price, loan terms, closing costs, and what you owe or receive at closing.", category: "Documents" },
  { term: "Deed", definition: "The legal document that transfers ownership of the property from seller to buyer. It gets signed at closing and recorded with the county.", category: "Documents" },
  { term: "Seller's Disclosure", definition: "A form where the seller lists everything they know about the property's condition — past repairs, known issues, flooding history, etc. Honesty here is legally required.", category: "Documents" },
  { term: "HOA Documents", definition: "If the property is in a homeowners association, these are the rules, financial statements, and fee schedules. Buyers review these to understand restrictions and costs.", category: "Documents" },

  // Negotiation
  { term: "Counteroffer", definition: "When the seller (or buyer) responds to an offer with different terms — usually a different price, closing date, or repair request. It goes back and forth until both sides agree or walk away.", category: "Negotiation" },
  { term: "Multiple Offers", definition: "When more than one buyer submits an offer on the same home. As a seller, you can choose the best one, counter some or all, or ask for \"highest and best\" from everyone.", category: "Negotiation" },
  { term: "Escalation Clause", definition: "A clause in a buyer's offer that automatically raises their price by a set amount above competing offers, up to a maximum. Common in competitive markets.", category: "Negotiation" },
  { term: "As-Is", definition: "The seller is selling the property in its current condition and won't make repairs. Buyers can still inspect, but the seller isn't obligated to fix anything.", category: "Negotiation" },
  { term: "Repair Credit", definition: "Instead of making repairs, the seller gives the buyer money at closing so they can handle the fixes themselves. Often simpler for both sides.", category: "Negotiation" },
];

const CATEGORIES = [...new Set(GLOSSARY.map((g) => g.category))];

export function PortalGlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = GLOSSARY.filter((g) => {
    const matchesSearch =
      !search ||
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !activeCategory || g.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: t.sectionGap }}>
        Real Estate Glossary
      </h1>

      {/* Search + Filters */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: t.textTertiary }} />
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputBase, paddingLeft: "36px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${!activeCategory ? t.teal : t.borderMedium}`,
              background: !activeCategory ? t.teal : "transparent",
              color: !activeCategory ? t.textInverse : t.textSecondary,
              fontSize: "13px",
              fontFamily: t.font,
              cursor: "pointer",
              fontWeight: !activeCategory ? 600 : 400,
            }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: `1px solid ${activeCategory === cat ? t.teal : t.borderMedium}`,
                background: activeCategory === cat ? t.teal : "transparent",
                color: activeCategory === cat ? t.textInverse : t.textSecondary,
                fontSize: "13px",
                fontFamily: t.font,
                cursor: "pointer",
                fontWeight: activeCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((g) => (
          <div key={g.term} style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ ...t.sectionHeader, color: t.text }}>{g.term}</span>
              <span style={{
                ...t.caption,
                color: t.teal,
                background: t.tealLight,
                padding: "2px 10px",
                borderRadius: "12px",
                fontWeight: 500,
              }}>
                {g.category}
              </span>
            </div>
            <p style={{ ...t.body, color: t.textSecondary, margin: 0 }}>{g.definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ ...t.body, color: t.textTertiary, textAlign: "center", padding: "40px" }}>
            No terms match your search.
          </p>
        )}
      </div>
    </div>
  );
}

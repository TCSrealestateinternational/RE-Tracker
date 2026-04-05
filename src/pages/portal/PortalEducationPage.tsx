import { useState } from "react";
import { Search, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { t, card, inputBase } from "@/styles/theme";

interface FAQ {
  question: string;
  answer: string;
  phase: string;
}

const FAQS: FAQ[] = [
  // Getting Started
  { phase: "Getting Started", question: "Why does my agent need so much paperwork from me?", answer: "Real estate transactions are heavily regulated. Lenders, title companies, and state laws all require specific documentation. Your agent is collecting what's needed to protect you legally and financially. Think of it as building a paper trail that ensures everything goes smoothly at closing." },
  { phase: "Getting Started", question: "How long does buying/selling a home actually take?", answer: "Typically 30–60 days from going under contract to closing. But the full process — including searching, getting pre-approved, and finding the right home — can take 3–6 months for buyers. Sellers usually need 2–4 weeks of prep before listing, then average 30–90 days on market depending on the area." },
  { phase: "Getting Started", question: "What if I change my mind after signing the listing agreement?", answer: "Most listing agreements have a cancellation clause. Talk to your agent — many will release you if you're unhappy, though there may be conditions. Read the agreement carefully before signing so you know the terms." },

  // Showings & Offers
  { phase: "Showings & Offers", question: "Why aren't we getting any showings?", answer: "Low showing activity usually means one of three things: the price is too high for the market, the listing photos/description need improvement, or the marketing reach is limited. Talk to your agent about their marketing plan and whether a price adjustment might help." },
  { phase: "Showings & Offers", question: "We got an offer below asking price. Should I be offended?", answer: "No — lowball offers are part of real estate. Buyers often start low to leave room for negotiation. Your agent will help you evaluate whether the offer is worth countering. Focus on the bottom line, not the initial number. Some of the best deals start with an offer that feels too low." },
  { phase: "Showings & Offers", question: "The buyer is asking for a lot of concessions. Is that normal?", answer: "Yes, especially in a buyer's market. Buyers may ask for closing cost help, repairs, or home warranties. Your agent will advise you on what's reasonable and what's excessive. Everything is negotiable — you don't have to agree to anything you're uncomfortable with." },
  { phase: "Showings & Offers", question: "What does 'highest and best' mean?", answer: "When you have multiple offers, your agent may ask all buyers to submit their 'highest and best' offer — their absolute top price and best terms. It gives everyone a fair shot and helps you compare the strongest offers side by side." },

  // Under Contract
  { phase: "Under Contract", question: "The inspection found problems. Does this kill the deal?", answer: "Almost every inspection finds something. Minor issues (leaky faucet, missing GFCI outlet) are normal. Major issues (foundation cracks, roof failure, mold) need discussion. Your agent will help you negotiate — the buyer may ask for repairs, credits, or a price reduction. Deals rarely fall apart over inspections alone." },
  { phase: "Under Contract", question: "The appraisal came in low. What now?", answer: "This is more common than you'd think. Options include: the seller lowers the price to match, the buyer pays the difference in cash, you split the difference, or you renegotiate. Your agent will walk you through the best strategy for your situation." },
  { phase: "Under Contract", question: "Why is the title search taking so long?", answer: "Title searches can uncover old liens, boundary disputes, or recording errors that take time to resolve. The title company is making sure you're getting (or selling) a property with clear ownership. Delays here are actually protecting you." },
  { phase: "Under Contract", question: "The buyer's financing fell through. What happens?", answer: "If the buyer had a financing contingency, they can usually back out and get their earnest money back. Your home goes back on the market. Your agent will work to relist quickly and may recommend requiring stronger pre-approval letters from future buyers." },
  { phase: "Under Contract", question: "Can the buyer back out after the inspection?", answer: "During the due diligence period, yes — usually for any reason. After that period, it depends on the contract terms and remaining contingencies. Your agent will explain the specific timelines in your contract." },

  // Closing
  { phase: "Closing", question: "Why do I need to sign so many documents at closing?", answer: "Federal and state regulations require detailed documentation of every aspect of the transaction — ownership transfer, loan terms, tax obligations, title insurance, and more. It feels like a lot, but each document serves a specific legal purpose. Your agent or attorney can explain any document you're unsure about." },
  { phase: "Closing", question: "When do I actually get my money (or keys)?", answer: "For sellers, proceeds are usually wired to your bank within 24–48 hours of closing, sometimes same-day. For buyers, you typically get the keys at the closing table or when the deed is recorded (which can be the same day or next business day)." },
  { phase: "Closing", question: "What if something is wrong at the final walk-through?", answer: "If the home isn't in the agreed-upon condition, don't panic but don't ignore it. Common issues: the seller left items behind, didn't complete agreed repairs, or caused damage while moving out. Your agent can delay closing or negotiate credits to resolve the issue." },
  { phase: "Closing", question: "What are prorated taxes and why am I paying them?", answer: "Property taxes are typically paid in advance for the year. At closing, the costs are split based on how long each party owned the home that year. If the seller prepaid taxes through December but closes in June, the buyer reimburses them for July–December." },

  // After Closing
  { phase: "After Closing", question: "I just closed. What should I do now?", answer: "Change your address with the post office, update your ID and voter registration, set up utilities in your name, change the locks (buyers), and keep copies of all your closing documents in a safe place. Your agent may also check in with you after closing to make sure everything is going well." },
  { phase: "After Closing", question: "I'm getting mail from my old mortgage company. Is that normal?", answer: "Yes — it takes a few weeks for the payoff to fully process and for marketing mail to stop. If you're getting bills or statements, contact your old lender to confirm the payoff was received. Keep your final payoff confirmation letter for your records." },
];

const PHASES = [...new Set(FAQS.map((f) => f.phase))];

export function PortalEducationPage() {
  const [search, setSearch] = useState("");
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = FAQS.filter((f) => {
    const matchesSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesPhase = !activePhase || f.phase === activePhase;
    return matchesSearch && matchesPhase;
  });

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "8px" }}>
        Is This Normal?
      </h1>
      <p style={{ ...t.body, color: t.textSecondary, marginBottom: t.sectionGap }}>
        Common questions and concerns — answered in plain language.
      </p>

      {/* Search + phase filter */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: t.textTertiary }} />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputBase, paddingLeft: "36px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActivePhase(null)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${!activePhase ? t.teal : t.borderMedium}`,
              background: !activePhase ? t.teal : "transparent",
              color: !activePhase ? t.textInverse : t.textSecondary,
              fontSize: "13px",
              fontFamily: t.font,
              cursor: "pointer",
              fontWeight: !activePhase ? 600 : 400,
            }}
          >
            All Phases
          </button>
          {PHASES.map((phase) => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: `1px solid ${activePhase === phase ? t.teal : t.borderMedium}`,
                background: activePhase === phase ? t.teal : "transparent",
                color: activePhase === phase ? t.textInverse : t.textSecondary,
                fontSize: "13px",
                fontFamily: t.font,
                cursor: "pointer",
                fontWeight: activePhase === phase ? 600 : 400,
              }}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.map((faq, i) => {
          const isOpen = expanded.has(i);
          return (
            <div key={i} style={{ ...card, padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => toggle(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "16px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: t.font,
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <HelpCircle size={18} color={t.teal} style={{ flexShrink: 0 }} />
                  <span style={{ ...t.body, fontWeight: 500, color: t.text }}>{faq.question}</span>
                </div>
                {isOpen ? <ChevronUp size={18} color={t.textTertiary} /> : <ChevronDown size={18} color={t.textTertiary} />}
              </button>
              {isOpen && (
                <div style={{ padding: "0 20px 16px 48px" }}>
                  <span style={{
                    ...t.caption,
                    color: t.teal,
                    background: t.tealLight,
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontWeight: 500,
                    display: "inline-block",
                    marginBottom: "10px",
                  }}>
                    {faq.phase}
                  </span>
                  <p style={{ ...t.body, color: t.textSecondary, margin: 0, lineHeight: 1.7 }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ ...t.body, color: t.textTertiary, textAlign: "center", padding: "40px" }}>
            No questions match your search.
          </p>
        )}
      </div>
    </div>
  );
}

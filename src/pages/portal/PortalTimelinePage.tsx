import { usePortalData } from "@/hooks/portal/usePortalData";
import { t, card } from "@/styles/theme";
import { BUYER_CHECKLIST_ITEMS, SELLER_CHECKLIST_ITEMS } from "@/types";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";

const MILESTONE_LABELS: Record<string, string> = {
  "New Lead": "Getting Started",
  Active: "Actively Working",
  "Under Contract": "Under Contract",
  Closed: "Closed — Congratulations!",
  Lost: "Transaction Ended",
};

function celebrationStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: t.successLight,
    color: t.success,
    padding: "4px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: t.font,
  };
}

export function PortalTimelinePage() {
  const { client, deal, checklist, loading } = usePortalData();

  if (loading) {
    return <p style={{ ...t.body, color: t.textTertiary, padding: "40px", textAlign: "center" }}>Loading your transaction...</p>;
  }

  if (!client || !deal) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>Welcome to Your Portal</h2>
        <p style={{ ...t.body, color: t.textSecondary }}>
          Your agent hasn't linked a transaction yet. Once they do, you'll see your full timeline here.
        </p>
      </div>
    );
  }

  const items = client.status === "seller" ? SELLER_CHECKLIST_ITEMS : BUYER_CHECKLIST_ITEMS;
  const checklistItems = checklist?.items || {};
  const completedCount = Object.values(checklistItems).filter(Boolean).length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const dealStage = deal.stage;
  const isClosed = dealStage === "Closed";

  return (
    <div>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "8px" }}>
        Your Transaction Timeline
      </h1>
      <p style={{ ...t.body, color: t.textSecondary, marginBottom: t.sectionGap }}>
        {client.status === "seller" ? `Selling: ${client.propertyAddress || "Your Property"}` : `Buying: ${client.searchCriteria || "Your New Home"}`}
      </p>

      {/* Progress bar */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ ...t.sectionHeader, color: t.text }}>Overall Progress</span>
          <span style={{ ...t.stat, color: t.teal, fontSize: "22px" }}>{pct}%</span>
        </div>
        <div style={{ height: "10px", background: t.tealLight, borderRadius: "5px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: isClosed ? t.success : t.teal,
            borderRadius: "5px",
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ ...t.caption, color: t.textTertiary }}>{completedCount} of {totalCount} steps complete</span>
          <span style={{ ...t.caption, color: t.teal, fontWeight: 600 }}>
            Stage: {MILESTONE_LABELS[dealStage] || dealStage}
          </span>
        </div>
      </div>

      {/* Milestone celebration */}
      {isClosed && (
        <div style={{
          ...card,
          background: t.successLight,
          border: `1px solid ${t.success}`,
          marginBottom: "20px",
          textAlign: "center",
          padding: "32px",
        }}>
          <PartyPopper size={36} color={t.success} style={{ marginBottom: "12px" }} />
          <h2 style={{ ...t.sectionHeader, color: t.success, marginBottom: "8px" }}>
            Transaction Complete!
          </h2>
          <p style={{ ...t.body, color: t.text }}>
            Congratulations on {client.status === "seller" ? "selling" : "buying"} your home!
          </p>
        </div>
      )}

      {/* Checklist timeline */}
      <div style={{ ...card }}>
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "20px" }}>
          {client.status === "seller" ? "Seller" : "Buyer"} Checklist
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map((item, i) => {
            const done = !!checklistItems[item];
            const isLast = i === items.length - 1;
            return (
              <div key={item} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {/* Timeline line + dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "24px" }}>
                  {done ? (
                    <CheckCircle2 size={20} color={t.success} />
                  ) : (
                    <Circle size={20} color={t.borderMedium} />
                  )}
                  {!isLast && (
                    <div style={{
                      width: "2px",
                      height: "28px",
                      background: done ? t.success : t.border,
                    }} />
                  )}
                </div>
                <div style={{
                  paddingBottom: isLast ? 0 : "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{
                    ...t.body,
                    color: done ? t.text : t.textTertiary,
                    fontWeight: done ? 500 : 400,
                    textDecoration: done ? "none" : "none",
                  }}>
                    {item}
                  </span>
                  {done && i > 0 && items[i - 1] && !checklistItems[items[i - 1]!] && (
                    <span style={celebrationStyle()}>
                      <PartyPopper size={12} /> Just completed!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

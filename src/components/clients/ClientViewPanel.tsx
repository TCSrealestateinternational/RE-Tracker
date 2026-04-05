import { useState } from "react";
import { Home, FileStack, CalendarClock, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { t, card } from "@/styles/theme";
import { BUYER_CHECKLIST_ITEMS, SELLER_CHECKLIST_ITEMS } from "@/types";
import type { Client, TransactionChecklist } from "@/types";

interface ClientViewPanelProps {
  client: Client;
  checklist?: TransactionChecklist;
}

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "8px", width: "100%",
          background: "none", border: "none", cursor: "pointer", padding: "8px 0",
          fontFamily: t.font,
        }}
      >
        <Chevron size={16} color={t.textSecondary} strokeWidth={2} />
        <span style={{ ...t.sectionHeader, color: t.text }}>{title}</span>
        {badge && (
          <span style={{
            ...t.caption, fontWeight: 600, color: t.textTertiary,
            background: t.bg, padding: "2px 8px", borderRadius: "4px",
          }}>
            {badge}
          </span>
        )}
      </button>
      {open && <div style={{ paddingLeft: "24px", paddingTop: "8px" }}>{children}</div>}
    </div>
  );
}

function ReadOnlyChecklist({ checklist }: { checklist: TransactionChecklist }) {
  const items = checklist.type === "buyer" ? BUYER_CHECKLIST_ITEMS : SELLER_CHECKLIST_ITEMS;
  const completedCount = Object.values(checklist.items).filter(Boolean).length;
  const totalItems = items.length;
  const pct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
      }}>
        <div style={{
          flex: 1, height: "6px", background: t.tealLight, borderRadius: "3px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: pct === 100 ? t.success : t.teal,
            borderRadius: "3px", transition: "width 0.3s",
          }} />
        </div>
        <span style={{
          ...t.caption, fontWeight: 600, whiteSpace: "nowrap",
          color: pct === 100 ? t.success : t.textTertiary,
        }}>
          {completedCount}/{totalItems} ({pct}%)
        </span>
      </div>

      {/* Items */}
      <div style={{ display: "grid", gap: "2px" }}>
        {items.map((item) => {
          const checked = checklist.items[item] ?? false;
          return (
            <div
              key={item}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "6px 10px", borderRadius: "6px",
              }}
            >
              <div style={{
                width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: checked ? t.teal : "transparent",
                border: checked ? "none" : `1.5px solid ${t.borderMedium}`,
              }}>
                {checked && <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />}
              </div>
              <span style={{
                ...t.body,
                color: checked ? t.textTertiary : t.text,
                textDecoration: checked ? "line-through" : "none",
              }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClientViewPanel({ client, checklist }: ClientViewPanelProps) {
  const isBuyer = client.status === "buyer";

  const detailRow = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "2px" }}>{label}</span>
        <span style={{ ...t.body, color: t.text }}>{value}</span>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      {/* Header banner */}
      <div style={{
        ...card,
        background: isBuyer ? "rgba(12, 65, 78, 0.04)" : "rgba(188, 128, 77, 0.04)",
        border: `1px solid ${isBuyer ? "rgba(12, 65, 78, 0.12)" : "rgba(188, 128, 77, 0.12)"}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px",
        }}>
          {isBuyer
            ? <Home size={16} color={t.teal} strokeWidth={2} />
            : <FileStack size={16} color={t.gold} strokeWidth={2} />}
          <span style={{
            ...t.label, fontSize: "11px", fontWeight: 700,
            color: isBuyer ? t.teal : t.gold,
          }}>
            {isBuyer ? "Buyer" : "Seller"} Dashboard
          </span>
          <span style={{
            padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
            textTransform: "uppercase",
            background: t.bg, color: t.textTertiary,
          }}>
            {client.stage}
          </span>
        </div>
        <p style={{ ...t.caption, color: t.textSecondary, margin: 0 }}>
          Read-only preview of the client's transaction view
        </p>
      </div>

      {/* Transaction Details */}
      <div style={card}>
        <CollapsibleSection
          title="Transaction Details"
          badge={isBuyer ? "Buyer" : "Seller"}
        >
          {isBuyer ? (
            <>
              {(client.lenderName || (client.preApprovalAmount ?? 0) > 0) && (
                <div style={{
                  background: t.tealLight, borderRadius: "8px", padding: "12px 16px", marginBottom: "12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  {client.lenderName && (
                    <div>
                      <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "2px" }}>Lender</span>
                      <span style={{ ...t.body, color: t.text, fontWeight: 500 }}>{client.lenderName}</span>
                    </div>
                  )}
                  {(client.preApprovalAmount ?? 0) > 0 && (
                    <div style={{ textAlign: client.lenderName ? "right" : "left" }}>
                      <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "2px" }}>Pre-Approval</span>
                      <span style={{ ...t.body, color: t.teal, fontWeight: 600 }}>{fmtDollars(client.preApprovalAmount)}</span>
                    </div>
                  )}
                </div>
              )}
              {(client.priceRange?.min > 0 || client.priceRange?.max > 0) && (
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "2px" }}>Price Range</span>
                  <span style={{ ...t.body, color: t.text }}>
                    {fmtDollars(client.priceRange.min)} – {fmtDollars(client.priceRange.max)}
                  </span>
                </div>
              )}
              {detailRow("Date Under Contract", client.dateUnderContract)}
              {detailRow("Projected Close Date", client.projectedCloseDate)}
              {client.searchCriteria && detailRow("Search Criteria", client.searchCriteria)}
            </>
          ) : (
            <>
              {client.propertyAddress && detailRow("Property Address", client.propertyAddress)}
              {(client.listPrice ?? 0) > 0 && detailRow("List Price", fmtDollars(client.listPrice))}

              {client.priceReductions?.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Price Reductions</span>
                  {client.priceReductions.map((r, i) => (
                    <div key={i} style={{ ...t.body, color: t.rust, marginBottom: "2px" }}>
                      −{fmtDollars(r)}
                    </div>
                  ))}
                  <div style={{ ...t.caption, color: t.textTertiary, marginTop: "4px" }}>
                    Effective price: {fmtDollars(client.listPrice - client.priceReductions.reduce((a, b) => a + b, 0))}
                  </div>
                </div>
              )}

              {/* Read-only offers */}
              {client.offers?.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>Offers</span>
                  <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${t.border}` }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr auto",
                      padding: "8px 12px", background: t.bg,
                      ...t.label, color: t.textTertiary,
                    }}>
                      <span>Amount</span>
                      <span>Status</span>
                    </div>
                    {client.offers.map((offer, i) => {
                      const statusColor =
                        offer.status === "accepted" ? t.success
                          : offer.status === "rejected" ? t.rust
                            : t.gold;
                      return (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "1fr auto",
                          padding: "8px 12px", borderTop: `1px solid ${t.border}`,
                          ...t.body,
                        }}>
                          <span style={{ color: t.text }}>{fmtDollars(offer.amount)}</span>
                          <span style={{
                            padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                            textTransform: "uppercase",
                            background: offer.status === "accepted" ? t.successLight
                              : offer.status === "rejected" ? t.rustLight : t.goldLight,
                            color: statusColor,
                          }}>
                            {offer.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {detailRow("Accepted Offer Date", client.acceptedOfferDate)}
              {detailRow("Expected Close Date", client.expectedCloseDate)}
            </>
          )}
        </CollapsibleSection>

        {/* Key Dates */}
        <CollapsibleSection title="Key Dates">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {isBuyer ? (
              <>
                <DateCard label="Under Contract" date={client.dateUnderContract} />
                <DateCard label="Projected Close" date={client.projectedCloseDate} />
              </>
            ) : (
              <>
                <DateCard label="Accepted Offer" date={client.acceptedOfferDate} />
                <DateCard label="Expected Close" date={client.expectedCloseDate} />
              </>
            )}
          </div>
        </CollapsibleSection>
      </div>

      {/* Checklist */}
      {checklist && (
        <div style={card}>
          <CollapsibleSection
            title="Transaction Checklist"
            badge={`${Object.values(checklist.items).filter(Boolean).length}/${(checklist.type === "buyer" ? BUYER_CHECKLIST_ITEMS : SELLER_CHECKLIST_ITEMS).length}`}
          >
            <ReadOnlyChecklist checklist={checklist} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

function DateCard({ label, date }: { label: string; date: string | null }) {
  return (
    <div style={{
      background: t.bg, borderRadius: "8px", padding: "12px 16px",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      <CalendarClock size={16} color={date ? t.teal : t.textTertiary} strokeWidth={1.5} />
      <div>
        <div style={{ ...t.label, color: t.textSecondary, marginBottom: "2px" }}>{label}</div>
        <div style={{ ...t.body, color: date ? t.text : t.textTertiary, fontWeight: date ? 500 : 400 }}>
          {date || "Not set"}
        </div>
      </div>
    </div>
  );
}

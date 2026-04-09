import { useState, useRef } from "react";
import { ArrowLeft, Edit3, Clock, DollarSign, TrendingUp, CalendarClock, ExternalLink, Home, FileStack, Eye, LayoutDashboard, Flame, Check, ChevronDown, ChevronRight, Download, MessageSquare, Plus, X, Archive } from "lucide-react";
import type { ChecklistTemplateItem } from "@/constants/checklist-buyer";
import { t, card, btnPrimary } from "@/styles/theme";
import { formatHours } from "@/utils/dates";
import { exportClientPDF } from "@/utils/export";
import type { Client, TimeEntry, TransactionChecklist, Deal } from "@/types";
import { BUYER_CHECKLIST_TEMPLATE, BUYER_STAGES } from "@/constants/checklist-buyer";
import { SELLER_CHECKLIST_TEMPLATE, SELLER_STAGES } from "@/constants/checklist-seller";
import { ClientViewPanel } from "./ClientViewPanel";
import { useSubscription } from "@/hooks/useSubscription";
import { useTransactionSync } from "@/hooks/useTransactionSync";

export type DetailTab = "overview" | "client-view";

interface ClientDetailProps {
  client: Client;
  entries: TimeEntry[];
  checklist?: TransactionChecklist;
  deal?: Deal;
  onToggleItem: (checklistId: string, checklist: TransactionChecklist, key: string, transactionId?: string) => void;
  onUpdateClient: (id: string, data: Partial<Client>) => Promise<void>;
  onEdit: () => void;
  onArchive?: () => void;
  onBack: () => void;
  initialTab?: DetailTab;
}

function getProjectedCommission(client: Client): number {
  if (client.commissionMode === "flat") return client.commissionFlat ?? 0;
  const pct = client.commissionPercent ?? 0;
  const base = client.status === "buyer"
    ? (client.priceRange?.max ?? 0)
    : (client.listPrice ?? 0);
  return base * (pct / 100);
}

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function ClientDetail({ client, entries, checklist, deal, onToggleItem, onUpdateClient, onEdit, onArchive, onBack, initialTab = "overview" }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const { hasHearthPortal } = useSubscription();
  const { syncDealToTransaction, activateHearthPortal } = useTransactionSync();
  const [portalActivating, setPortalActivating] = useState(false);
  const [portalError, setPortalError] = useState("");
  const transactionId = deal?.transactionId;

  async function handleActivatePortal() {
    if (!deal || portalActivating) return;
    setPortalActivating(true);
    setPortalError("");
    try {
      const txId = await syncDealToTransaction(deal, client);
      await activateHearthPortal(txId);
    } catch (err) {
      console.error("Failed to activate Hearth portal:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
        setPortalError("Firestore permission denied — the 'transactions' collection rules may need updating.");
      } else {
        setPortalError("Failed to activate Hearth portal. " + msg);
      }
    } finally {
      setPortalActivating(false);
    }
  }

  const clientEntries = entries.filter((e) => e.clientId === client.id);
  const totalMs = clientEntries.reduce((sum, e) => sum + e.durationMs, 0);
  const totalHours = totalMs / 3_600_000;
  const revenuePerHour = totalHours > 0 ? client.commissionEarned / totalHours : 0;
  const projectedCommission = getProjectedCommission(client);

  const stats = [
    { label: "Time Logged", value: formatHours(totalMs), color: t.teal, icon: Clock },
    { label: "Commission", value: fmtDollars(client.commissionEarned), color: t.gold, icon: DollarSign },
    { label: "Revenue/Hour", value: `$${revenuePerHour.toFixed(0)}`, color: t.teal, icon: TrendingUp },
    { label: "Follow-Up", value: client.followUpDate || "—", color: client.followUpDate ? t.rust : t.textTertiary, icon: CalendarClock },
  ];

  const tabs: { key: DetailTab; label: string; icon: typeof Eye }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "client-view", label: "Client View", icon: Eye },
  ];

  const checklistTemplate = checklist
    ? (checklist.type === "buyer" ? BUYER_CHECKLIST_TEMPLATE : SELLER_CHECKLIST_TEMPLATE)
    : [];
  const checklistStages = checklist
    ? (checklist.type === "buyer" ? BUYER_STAGES : SELLER_STAGES)
    : [];
  const completedCount = checklist ? checklistTemplate.filter((item) => checklist.items[item.label]).length : 0;
  const totalItems = checklistTemplate.length;
  const pct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

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
      {/* ── Header Card (always visible) ── */}
      <div style={card}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: t.textTertiary,
          cursor: "pointer", padding: 0, fontFamily: t.font,
          display: "flex", alignItems: "center", gap: "6px",
          ...t.caption, marginBottom: "20px",
        }}>
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Clients
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
          <div style={{ minWidth: 0, flex: "1 1 200px" }}>
            <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "4px" }}>{client.name}</h2>
            <p style={{ ...t.caption, color: t.textTertiary, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "2px 8px", borderRadius: "4px",
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase",
                background: isBuyer ? "rgba(12, 65, 78, 0.10)" : "rgba(188, 128, 77, 0.12)",
                color: isBuyer ? t.teal : t.gold,
              }}>
                {isBuyer ? <Home size={11} strokeWidth={2.5} /> : <FileStack size={11} strokeWidth={2.5} />}
                {client.status}
              </span>
              <span>{client.stage}</span>
              {client.leadSource && <span>&middot; {client.leadSource}</span>}
              {client.email && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px", display: "inline-block" }}>&middot; {client.email}</span>}
              {client.phone && <span>&middot; {client.phone}</span>}
            </p>
            {client.additionalContacts?.length > 0 && (
              <p style={{ ...t.caption, color: t.textTertiary, marginTop: "4px", wordBreak: "break-word" }}>
                Also: {client.additionalContacts.map((c) => {
                  const parts = [c.name];
                  if (c.email) parts.push(c.email);
                  if (c.phone) parts.push(c.phone);
                  return parts.join(" — ");
                }).join("; ")}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
            {hasHearthPortal && deal && !transactionId && (
              <button
                onClick={handleActivatePortal}
                disabled={portalActivating}
                style={{
                  ...btnPrimary,
                  display: "flex", alignItems: "center", gap: "6px",
                  opacity: portalActivating ? 0.6 : 1,
                  fontSize: "13px", padding: "8px 14px",
                }}
              >
                <Flame size={14} strokeWidth={1.5} />
                {portalActivating ? "Activating..." : "Activate Hearth"}
              </button>
            )}
            {hasHearthPortal && transactionId && (
              <span style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", fontSize: "13px", fontFamily: t.font,
                color: t.success, background: t.successLight, borderRadius: "8px",
              }}>
                <Check size={14} strokeWidth={2} />
                Hearth Active
              </span>
            )}
            <button onClick={() => exportClientPDF(client)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", background: "transparent", border: `1px solid ${t.border}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: t.font,
              color: t.textSecondary,
            }}>
              <Download size={14} strokeWidth={1.5} />
              PDF
            </button>
            <button onClick={onEdit} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", background: "transparent", border: `1px solid ${t.border}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: t.font,
              color: t.textSecondary,
            }}>
              <Edit3 size={14} strokeWidth={1.5} />
              Edit
            </button>
            {onArchive && client.stage !== "archived" && (
              <button onClick={onArchive} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", background: "transparent", border: `1px solid ${t.border}`,
                borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: t.font,
                color: t.textSecondary,
              }}>
                <Archive size={14} strokeWidth={1.5} />
                Archive
              </button>
            )}
          </div>
        </div>

        {portalError && (
          <div style={{
            background: t.rustLight, border: `1px solid rgba(157, 68, 42, 0.15)`,
            borderRadius: "8px", padding: "10px 14px", marginBottom: "4px",
            ...t.caption, color: t.rust,
          }}>
            {portalError}
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div style={{
          display: "flex", gap: "4px", borderBottom: `1px solid ${t.border}`,
          marginLeft: `-${t.cardPadding}`, marginRight: `-${t.cardPadding}`,
          paddingLeft: t.cardPadding, paddingRight: t.cardPadding,
        }}>
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 16px", background: "none", border: "none",
                  borderBottom: isActive ? `2px solid ${t.teal}` : "2px solid transparent",
                  cursor: "pointer", fontFamily: t.font,
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? t.teal : t.textTertiary,
                  transition: "color 0.15s, border-color 0.15s",
                  marginBottom: "-1px",
                }}
              >
                <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "overview" && (
        <>
          {/* Stats + Details Card */}
          <div style={card}>
            <div className="grid-4col" style={{ marginBottom: "28px" }}>
              {stats.map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ background: t.bg, padding: "16px", borderRadius: "8px" }}>
                  <Icon size={14} color={t.textTertiary} strokeWidth={1.5} style={{ marginBottom: "8px" }} />
                  <div style={{ ...t.stat, fontSize: "20px", color }}>{value}</div>
                  <div style={{ ...t.label, color: t.textTertiary, marginTop: "4px" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Projected Commission */}
            {projectedCommission > 0 && (
              <div style={{
                background: t.goldLight, borderRadius: "8px", padding: "12px 16px", marginBottom: "20px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ ...t.label, color: t.gold }}>Projected Commission</span>
                <span style={{ fontWeight: 700, fontSize: "16px", color: t.gold, fontFamily: t.font }}>
                  {fmtDollars(projectedCommission)}
                  {client.commissionMode === "percentage" && (
                    <span style={{ fontWeight: 400, fontSize: "12px", marginLeft: "6px", opacity: 0.7 }}>
                      ({client.commissionPercent}%)
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* ── Buyer-Specific Details ── */}
            {isBuyer && (
              <div style={{ marginBottom: "16px" }}>
                {(client.lenderName || (client.preApprovalAmount ?? 0) > 0) && (
                  <div style={{
                    background: t.tealLight, borderRadius: "8px", padding: "12px 16px", marginBottom: "12px",
                    display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px",
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
              </div>
            )}

            {/* ── Seller-Specific Details ── */}
            {!isBuyer && (
              <div style={{ marginBottom: "16px" }}>
                {client.propertyAddress && detailRow("Property Address", client.propertyAddress)}
                {(client.listPrice ?? 0) > 0 && detailRow("List Price", fmtDollars(client.listPrice))}

                {/* Price Reductions */}
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

                {/* Offers Table */}
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
              </div>
            )}

            {client.notes && (
              <div style={{ marginBottom: "16px" }}>
                <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Notes</span>
                <p style={{ ...t.body, color: t.text }}>{client.notes}</p>
              </div>
            )}

            {/* ── Google Drive Links ── */}
            {client.driveLinks?.length > 0 && (
              <div>
                <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "8px" }}>Google Drive</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {client.driveLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 12px", borderRadius: "8px",
                        background: t.bg, textDecoration: "none",
                        transition: "background 0.12s",
                        ...t.body, color: t.teal,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = t.tealLight; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = t.bg; }}
                    >
                      <ExternalLink size={14} strokeWidth={1.5} />
                      <span style={{ fontWeight: 500 }}>{link.label || link.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Client Dashboard Message ── */}
          <ClientDashboardMessageCard client={client} onUpdateClient={onUpdateClient} />

          {/* ── Transaction Checklist ── */}
          {checklist && (
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ ...t.sectionHeader, color: t.text }}>Transaction Checklist</h3>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                    background: checklist.type === "buyer" ? t.tealLight : t.goldLight,
                    color: checklist.type === "buyer" ? t.teal : t.gold,
                    textTransform: "uppercase",
                  }}>
                    {checklist.type === "buyer" ? <Home size={11} strokeWidth={2.5} /> : <FileStack size={11} strokeWidth={2.5} />}
                    {checklist.type}
                  </span>
                </div>
                <span style={{
                  ...t.caption, fontWeight: 600,
                  color: pct === 100 ? t.success : t.textTertiary,
                }}>
                  {completedCount}/{totalItems} ({pct}%)
                </span>
              </div>

              <div style={{
                height: "3px", background: t.tealLight, borderRadius: "2px",
                overflow: "hidden", marginBottom: "20px",
              }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: pct === 100 ? t.success : t.teal,
                  borderRadius: "2px", transition: "width 0.3s",
                }} />
              </div>

              <div style={{ display: "grid", gap: "4px" }}>
                {checklistStages.map((stage) => {
                  const stageItems = checklistTemplate.filter((item) => item.stage === stage);
                  const stageDone = stageItems.filter((item) => checklist.items[item.label]).length;
                  const allDone = stageDone === stageItems.length;
                  return (
                    <DetailStageSection
                      key={stage}
                      stage={stage}
                      items={stageItems}
                      completed={stageDone}
                      allDone={allDone}
                      checklist={checklist}
                      transactionId={transactionId}
                      onToggleItem={onToggleItem}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Client View Tab ── */}
      {activeTab === "client-view" && (
        <ClientViewPanel client={client} checklist={checklist} onToggleItem={onToggleItem} />
      )}
    </div>
  );
}

function ClientDashboardMessageCard({
  client,
  onUpdateClient,
}: {
  client: Client;
  onUpdateClient: (id: string, data: Partial<Client>) => Promise<void>;
}) {
  const [message, setMessage] = useState(client.statusMessage ?? "");
  const [items, setItems] = useState<string[]>(client.actionItems ?? []);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function saveMessage(val: string) {
    setSaving(true);
    await onUpdateClient(client.id, { statusMessage: val || undefined });
    setSaving(false);
  }

  async function saveItems(updated: string[]) {
    setItems(updated);
    await onUpdateClient(client.id, { actionItems: updated.length > 0 ? updated : undefined });
  }

  function handleAddItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const updated = [...items, trimmed];
    setNewItem("");
    saveItems(updated);
  }

  function handleRemoveItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    saveItems(updated);
  }

  const firstName = client.name.split(" ")[0];

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <MessageSquare size={16} color={t.teal} strokeWidth={2} />
        <h3 style={{ ...t.sectionHeader, color: t.text }}>Client Dashboard Message</h3>
      </div>
      <p style={{ ...t.caption, color: t.textTertiary, marginBottom: "16px" }}>
        This is what {firstName} sees on their dashboard while waiting for a transaction.
      </p>

      {/* Status message textarea */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
          Status Message
        </label>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => saveMessage(message)}
          placeholder="e.g. We're waiting on your pre-approval letter"
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: `1px solid ${t.borderMedium}`,
            fontSize: "14px",
            fontFamily: t.font,
            color: t.text,
            background: t.surface,
            outline: "none",
            boxSizing: "border-box" as const,
            resize: "vertical",
            transition: "border-color 0.15s",
          }}
        />
        {saving && <span style={{ ...t.caption, color: t.textTertiary, marginTop: "4px", display: "block" }}>Saving...</span>}
      </div>

      {/* Action items list */}
      <div>
        <label style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "8px" }}>
          Action Items
        </label>
        {items.length > 0 && (
          <div style={{ display: "grid", gap: "4px", marginBottom: "8px" }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: t.bg,
                  borderRadius: "6px",
                }}
              >
                <span style={{ ...t.body, color: t.text, flex: 1 }}>{item}</span>
                <button
                  onClick={() => handleRemoveItem(i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    color: t.textTertiary,
                  }}
                  title="Remove item"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new item */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); }}
            placeholder="Add an action item..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1px solid ${t.borderMedium}`,
              fontSize: "14px",
              fontFamily: t.font,
              color: t.text,
              background: t.surface,
              outline: "none",
              boxSizing: "border-box" as const,
            }}
          />
          <button
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "8px 12px",
              background: newItem.trim() ? t.teal : t.bg,
              color: newItem.trim() ? t.textInverse : t.textTertiary,
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: t.font,
              cursor: newItem.trim() ? "pointer" : "default",
              transition: "background 0.15s",
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailStageSection({
  stage,
  items,
  completed,
  allDone,
  checklist,
  transactionId,
  onToggleItem,
}: {
  stage: string;
  items: ChecklistTemplateItem[];
  completed: number;
  allDone: boolean;
  checklist: TransactionChecklist;
  transactionId?: string;
  onToggleItem: (checklistId: string, checklist: TransactionChecklist, key: string, transactionId?: string) => void;
}) {
  const [open, setOpen] = useState(!allDone);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div style={{ borderRadius: "8px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "8px", width: "100%",
          background: t.bg, border: "none", cursor: "pointer",
          padding: "10px 12px", fontFamily: t.font,
        }}
      >
        <Chevron size={14} color={t.textSecondary} strokeWidth={2} />
        <span style={{
          ...t.label, flex: 1, textAlign: "left",
          color: allDone ? t.success : t.text,
          textDecoration: allDone ? "line-through" : "none",
        }}>
          {stage}
        </span>
        <span style={{
          ...t.caption, fontWeight: 600,
          color: allDone ? t.success : t.textTertiary,
        }}>
          {completed}/{items.length}
        </span>
      </button>
      {open && (
        <div style={{ padding: "2px 0 8px 12px" }}>
          {items.map((item) => {
            const checked = checklist.items[item.label] ?? false;
            return (
              <label
                key={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "6px", cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleItem(checklist.id, checklist, item.label, transactionId)}
                  style={{ accentColor: t.teal, width: "15px", height: "15px", cursor: "pointer" }}
                />
                <span style={{
                  ...t.body,
                  color: checked ? t.textTertiary : t.text,
                  textDecoration: checked ? "line-through" : "none",
                }}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

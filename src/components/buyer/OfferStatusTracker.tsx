import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";
import { useOffers } from "@/hooks/useOffers";
import { useAuth } from "@/context/AuthContext";
import type { TrackedOffer, TrackedOfferStatus } from "@/types";

interface OfferStatusTrackerProps {
  transactionId: string;
  agentId?: string;
}

const STATUS_CONFIG: Record<TrackedOfferStatus, { color: string; bg: string; icon: string }> = {
  draft:     { color: t.textTertiary, bg: t.bg, icon: "edit_note" },
  submitted: { color: t.teal, bg: t.tealLight, icon: "send" },
  countered: { color: t.gold, bg: t.goldLight, icon: "swap_horiz" },
  accepted:  { color: t.success, bg: t.successLight, icon: "check_circle" },
  rejected:  { color: t.rust, bg: t.rustLight, icon: "cancel" },
  withdrawn: { color: t.textTertiary, bg: t.bg, icon: "undo" },
  expired:   { color: t.textTertiary, bg: t.bg, icon: "schedule" },
};

const STATUS_OPTIONS: TrackedOfferStatus[] = ["draft", "submitted", "countered", "accepted", "rejected", "withdrawn", "expired"];

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function OfferStatusTracker({ transactionId, agentId }: OfferStatusTrackerProps) {
  const { user } = useAuth();
  const { offers, loading, addOffer, updateOfferStatus } = useOffers(transactionId);
  const isAgent = !!agentId && user?.uid === agentId;

  // Add offer form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Update status state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<TrackedOfferStatus>("submitted");
  const [statusNote, setStatusNote] = useState("");
  const [counterAmt, setCounterAmt] = useState("");

  async function handleAdd() {
    if (!newAddress.trim() || !newAmount) return;
    setSubmitting(true);
    try {
      await addOffer({ propertyAddress: newAddress.trim(), offerAmount: Number(newAmount), notes: newNotes });
      setNewAddress(""); setNewAmount(""); setNewNotes(""); setShowAddForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(offer: TrackedOffer) {
    setSubmitting(true);
    try {
      await updateOfferStatus(
        offer.id, offer, newStatus, statusNote || undefined,
        newStatus === "countered" && counterAmt ? Number(counterAmt) : undefined,
      );
      setEditingId(null); setStatusNote(""); setCounterAmt("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Icon name="gavel" size={20} color={t.teal} />
        <span style={{ ...t.sectionHeader, color: t.text }}>Offer Status</span>
        {offers.length > 0 && (
          <span style={{ ...t.caption, fontWeight: 600, color: t.textTertiary, background: t.bg, padding: "2px 8px", borderRadius: "4px" }}>
            {offers.length}
          </span>
        )}
        {isAgent && !showAddForm && (
          <button onClick={() => setShowAddForm(true)} style={{ ...btnSecondary, padding: "4px 12px", fontSize: "12px", marginLeft: "auto" }}>
            + Add Offer
          </button>
        )}
      </div>

      {/* Add Offer Form (Agent Only) */}
      {isAgent && showAddForm && (
        <div style={{ background: t.bg, borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Property Address</label>
              <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} style={inputBase} />
            </div>
            <div>
              <label style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Offer Amount</label>
              <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} style={inputBase} placeholder="300000" />
            </div>
          </div>
          <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Notes..." rows={2} style={{ ...inputBase, resize: "vertical", marginBottom: "12px" }} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleAdd} disabled={!newAddress.trim() || !newAmount || submitting} style={{ ...btnPrimary, opacity: !newAddress.trim() || !newAmount || submitting ? 0.5 : 1 }}>
              {submitting ? "Adding..." : "Add Offer"}
            </button>
            <button onClick={() => setShowAddForm(false)} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Offers List */}
      {loading ? (
        <div style={{ ...t.body, color: t.textTertiary }}>Loading offers...</div>
      ) : offers.length === 0 ? (
        <div style={{ ...t.body, color: t.textTertiary, fontStyle: "italic", padding: "12px 0" }}>
          No offers submitted yet.
        </div>
      ) : (
        offers.map((offer) => {
          const config = STATUS_CONFIG[offer.status];
          return (
            <div key={offer.id} style={{ border: `1px solid ${t.border}`, borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
              {/* Offer Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ ...t.body, fontWeight: 600, color: t.text, marginBottom: "2px" }}>{offer.propertyAddress}</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: t.teal, fontFamily: t.fontHeadline, fontStyle: "italic" }}>
                    {fmtDollars(offer.offerAmount)}
                  </div>
                  {offer.counterAmount && (
                    <div style={{ ...t.caption, color: t.gold, marginTop: "2px" }}>
                      Counter: {fmtDollars(offer.counterAmount)}
                    </div>
                  )}
                </div>
                <span style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  ...t.caption, fontWeight: 600, color: config.color,
                  background: config.bg, padding: "4px 10px", borderRadius: "4px",
                }}>
                  <Icon name={config.icon} size={14} color={config.color} />
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
              </div>

              {offer.notes && <p style={{ ...t.caption, color: t.textSecondary, marginBottom: "10px" }}>{offer.notes}</p>}

              {/* Timeline */}
              {offer.timeline && offer.timeline.length > 0 && (
                <div style={{ position: "relative", paddingLeft: "20px", marginBottom: "10px" }}>
                  <div style={{ position: "absolute", left: "5px", top: "6px", bottom: "6px", width: "2px", background: t.border }} />
                  {offer.timeline.map((event, i) => {
                    const evConfig = STATUS_CONFIG[event.status];
                    const isLast = i === offer.timeline.length - 1;
                    return (
                      <div key={i} style={{ position: "relative", paddingBottom: isLast ? 0 : "10px" }}>
                        <div style={{
                          position: "absolute", left: "-20px", top: "4px",
                          width: "12px", height: "12px", borderRadius: "50%",
                          border: `2px solid ${evConfig.color}`,
                          background: isLast ? evConfig.color : t.surface,
                        }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ ...t.caption, fontWeight: 600, color: evConfig.color }}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          <span style={{ ...t.caption, color: t.textTertiary }}>{fmtTimestamp(event.timestamp)}</span>
                        </div>
                        {event.note && <p style={{ ...t.caption, color: t.textSecondary, marginTop: "2px" }}>{event.note}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Agent Update Status */}
              {isAgent && editingId === offer.id ? (
                <div style={{ background: t.bg, borderRadius: "6px", padding: "12px", marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s} onClick={() => setNewStatus(s)} style={{
                        padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                        fontFamily: t.font, cursor: "pointer",
                        background: newStatus === s ? STATUS_CONFIG[s].color : "transparent",
                        color: newStatus === s ? t.textInverse : STATUS_CONFIG[s].color,
                        border: newStatus === s ? "none" : `1px solid ${t.borderMedium}`,
                      }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {newStatus === "countered" && (
                    <input type="number" value={counterAmt} onChange={(e) => setCounterAmt(e.target.value)} placeholder="Counter amount" style={{ ...inputBase, marginBottom: "8px" }} />
                  )}
                  <input type="text" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Add a note..." style={{ ...inputBase, marginBottom: "8px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleUpdateStatus(offer)} disabled={submitting} style={{ ...btnPrimary, padding: "6px 14px", fontSize: "12px" }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: "12px" }}>Cancel</button>
                  </div>
                </div>
              ) : isAgent ? (
                <button onClick={() => { setEditingId(offer.id); setNewStatus(offer.status); }} style={{ ...btnSecondary, padding: "6px 14px", fontSize: "12px", marginTop: "8px" }}>
                  Update Status
                </button>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

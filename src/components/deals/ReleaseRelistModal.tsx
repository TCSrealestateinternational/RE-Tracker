import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, card, btnPrimary, btnSecondary } from "@/styles/theme";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { Deal, Client, TransactionChecklist } from "@/types";

interface ReleaseRelistModalProps {
  deal: Deal;
  client: Client;
  checklist?: TransactionChecklist;
  onClose: () => void;
  onReleaseBuyer: (deal: Deal, client: Client, reason: string) => Promise<void>;
  onRelistSeller: (deal: Deal, client: Client, checklist: TransactionChecklist | undefined, reason: string) => Promise<void>;
}

export function ReleaseRelistModal({
  deal,
  client,
  checklist,
  onClose,
  onReleaseBuyer,
  onRelistSeller,
}: ReleaseRelistModalProps) {
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState(false);
  const isBuyer = client.status === "buyer";

  const dialogRef = useFocusTrap<HTMLDivElement>({
    onEscape: () => { if (!working) onClose(); },
  });

  async function handleConfirm() {
    if (working) return;
    setWorking(true);
    try {
      if (isBuyer) {
        await onReleaseBuyer(deal, client, reason);
      } else {
        await onRelistSeller(deal, client, checklist, reason);
      }
      onClose();
    } catch (err) {
      console.error("Release/relist failed:", err);
      setWorking(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
      }}
      onClick={() => { if (!working) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="release-modal-title"
        style={{
          ...card, maxWidth: "480px", width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <Icon name={isBuyer ? "undo" : "storefront"} size={18} color={isBuyer ? t.rust : t.gold} />
          <h3 id="release-modal-title" style={{ ...t.sectionHeader, color: t.text }}>
            {isBuyer ? `Release ${client.name}'s Offer?` : `Relist ${client.name}'s Property?`}
          </h3>
        </div>

        {isBuyer ? (
          <div style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
            <p style={{ marginBottom: "10px" }}>
              This will archive the current transaction and create a fresh one for {client.name.split(" ")[0]}:
            </p>
            <ul style={{ paddingLeft: "18px", display: "grid", gap: "4px", ...t.caption, color: t.textTertiary }}>
              <li>Current deal moves to <strong style={{ color: t.rust }}>Released</strong></li>
              <li>New deal created at <strong style={{ color: t.teal }}>Active</strong></li>
              <li>Fresh checklist — client starts over</li>
              <li>Messages and client info carry over</li>
            </ul>
          </div>
        ) : (
          <div style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
            <p style={{ marginBottom: "10px" }}>
              This will put {client.name.split(" ")[0]}'s property back on the market:
            </p>
            <ul style={{ paddingLeft: "18px", display: "grid", gap: "4px", ...t.caption, color: t.textTertiary }}>
              <li>Deal moves back to <strong style={{ color: t.teal }}>Active</strong></li>
              <li>Phases 1–3 checklist items stay completed</li>
              <li>Phases 4–10 (Offer Received onward) get <strong style={{ color: t.rust }}>reset</strong></li>
              <li>Accepted offer marked as withdrawn</li>
            </ul>
          </div>
        )}

        {/* Reason field */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
            Reason for release
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isBuyer
              ? "e.g., Inspection revealed foundation issues"
              : "e.g., Buyer financing fell through"
            }
            rows={2}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: "8px",
              border: `1px solid ${t.borderMedium}`, fontSize: "14px",
              fontFamily: t.font, color: t.text, background: t.surface,
              outline: "none", boxSizing: "border-box" as const, resize: "vertical",
            }}
          />
        </div>

        {/* Client portal notice */}
        {client.hearthUserId && (
          <div style={{
            background: t.tealLight, borderRadius: "8px", padding: "10px 14px",
            marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Icon name="local_fire_department" size={14} color={t.teal} />
            <span style={{ ...t.caption, color: t.teal }}>
              {isBuyer
                ? "The client's Hearth portal will reset with a fresh checklist."
                : "The client's Hearth checklist will be partially reset (Phases 4–10)."}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={working}
            style={{ ...btnSecondary, opacity: working ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={working}
            style={{
              ...btnPrimary,
              display: "flex", alignItems: "center", gap: "6px",
              opacity: working ? 0.6 : 1,
              background: isBuyer ? t.rust : t.gold,
            }}
          >
            <Icon name={isBuyer ? "undo" : "storefront"} size={14} />
            {working
              ? (isBuyer ? "Releasing…" : "Relisting…")
              : (isBuyer ? "Release & Reset" : "Back on Market")
            }
          </button>
        </div>
      </div>
    </div>
  );
}

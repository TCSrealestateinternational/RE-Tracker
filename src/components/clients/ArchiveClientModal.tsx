import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, card, btnPrimary, btnSecondary } from "@/styles/theme";
import type { Client } from "@/types";

interface ArchiveClientModalProps {
  client: Client;
  onClose: () => void;
  onConfirm: (opts: { archiveHearth: boolean }) => Promise<void>;
}

export function ArchiveClientModal({ client, onClose, onConfirm }: ArchiveClientModalProps) {
  const [archiveHearth, setArchiveHearth] = useState(false);
  const [working, setWorking] = useState(false);

  const hasHearthLink = Boolean(client.hearthUserId);

  async function handleConfirm() {
    if (working) return;
    setWorking(true);
    try {
      await onConfirm({ archiveHearth });
    } finally {
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
        style={{
          ...card, maxWidth: "440px", width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <Icon name="archive" size={18} color={t.textSecondary} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>
            Archive {client.name}?
          </h3>
        </div>
        <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
          This client will move to the Archived folder. Transactions and checklists
          stay for your records. You can review archived clients any time and set a
          1-year follow-up reminder.
        </p>

        {hasHearthLink && (
          <div
            style={{
              background: t.bg,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                cursor: "pointer", fontFamily: t.font,
              }}
            >
              <input
                type="checkbox"
                checked={archiveHearth}
                onChange={(e) => setArchiveHearth(e.target.checked)}
                style={{ accentColor: t.teal, width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span style={{ ...t.body, color: t.text, fontWeight: 500 }}>
                Also flag the Hearth portal as archived
              </span>
            </label>
            <p style={{ ...t.caption, color: t.textTertiary, marginTop: "6px", marginLeft: "26px" }}>
              Client keeps portal access; this is a soft flag for Hearth.
            </p>
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
            }}
          >
            <Icon name="archive" size={14} />
            {working ? "Archiving…" : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}

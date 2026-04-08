import { useState } from "react";
import { Gift, ChevronDown, ChevronRight } from "lucide-react";
import { t, card, btnPrimary } from "@/styles/theme";
import type { Referral } from "@/types";

interface ReferralListProps {
  referrals: Referral[];
  onSelect: (referral: Referral) => void;
  onAdd: () => void;
}

function fmtDollars(n: number): string {
  if (n === 0) return "";
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: t.goldLight, color: t.gold },
  "under-contract": { bg: t.tealLight, color: t.teal },
  closed: { bg: t.successLight, color: t.success },
  paid: { bg: t.successLight, color: t.success },
  lost: { bg: t.rustLight, color: t.rust },
};

type FolderKey = "paid" | "lost";

export function ReferralList({ referrals, onSelect, onAdd }: ReferralListProps) {
  // Separate active vs folder referrals
  const activeReferrals = referrals.filter((r) => r.status !== "paid" && r.status !== "lost");
  const paidReferrals = referrals.filter((r) => r.status === "paid");
  const lostReferrals = referrals.filter((r) => r.status === "lost");

  const [openFolders, setOpenFolders] = useState<Record<FolderKey, boolean>>({ paid: false, lost: false });
  function toggleFolder(key: FolderKey) {
    setOpenFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const renderRow = (r: Referral) => {
    const sc = statusColors[r.status] || { bg: t.goldLight, color: t.gold };
    return (
      <div
        key={r.id}
        style={{
          ...card,
          display: "flex", alignItems: "center", gap: "12px",
          padding: "16px 20px", marginBottom: "0",
          cursor: "pointer", transition: "background 0.12s", fontFamily: t.font,
        }}
        onClick={() => onSelect(r)}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: t.text }}>{r.clientName}</span>
            <span style={{
              padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
              textTransform: "uppercase", background: sc.bg, color: sc.color,
            }}>
              {r.status}
            </span>
          </div>
          <div style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
            To: {r.agentName}
            {r.referralDate && <> &middot; {r.referralDate}</>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
          {r.referralFee > 0 && (
            <span style={{ fontWeight: 600, fontSize: "14px", color: t.gold }}>
              {fmtDollars(r.referralFee)}
            </span>
          )}
          {r.referralFee > 0 && (
            <span style={{ ...t.caption, color: t.textTertiary }}>
              {r.referralPercent}% fee
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderFolder = (key: FolderKey, label: string, items: Referral[], color: string) => {
    if (items.length === 0) return null;
    const isOpen = openFolders[key];
    return (
      <div style={{ marginBottom: "8px" }}>
        <button
          onClick={() => toggleFolder(key)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            padding: "10px 4px", width: "100%", fontFamily: t.font,
          }}
        >
          {isOpen
            ? <ChevronDown size={16} color={t.textTertiary} strokeWidth={2} />
            : <ChevronRight size={16} color={t.textTertiary} strokeWidth={2} />
          }
          <span style={{ ...t.label, color }}>{label}</span>
          <span style={{
            padding: "1px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600,
            background: t.bg, color: t.textTertiary,
          }}>
            {items.length}
          </span>
        </button>
        {isOpen && (
          <div style={{ display: "grid", gap: "8px", paddingLeft: "8px" }}>
            {items.map((r) => renderRow(r))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...t.pageTitle, color: t.text }}>Referrals</h2>
        <button data-tour="add-referral" onClick={onAdd} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
          <Gift size={16} strokeWidth={2} />
          Add Referral
        </button>
      </div>

      {/* Paid / Lost folders */}
      {renderFolder("paid", "Paid", paidReferrals, t.success)}
      {renderFolder("lost", "Lost", lostReferrals, t.textTertiary)}

      {/* Active referrals */}
      <div style={{ display: "grid", gap: "8px" }}>
        {activeReferrals.map((r) => renderRow(r))}
        {referrals.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ ...t.body, color: t.textTertiary, marginBottom: "4px" }}>
              No referrals yet.
            </p>
            <p style={{ ...t.caption, color: t.textTertiary }}>
              Track referrals you send to other agents and earn your 25% fee.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

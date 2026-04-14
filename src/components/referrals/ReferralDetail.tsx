import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import { REFERRAL_STATUS_LABELS, type Referral } from "@/types";

interface ReferralDetailProps {
  referral: Referral;
  onEdit: () => void;
  onBack: () => void;
  onDelete: (id: string) => Promise<void>;
}

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: t.goldLight, color: t.gold },
  searching: { bg: t.goldLight, color: t.gold },
  "pre-listing": { bg: t.goldLight, color: t.gold },
  listed: { bg: t.tealLight, color: t.teal },
  "under-contract": { bg: t.tealLight, color: t.teal },
  closed: { bg: t.successLight, color: t.success },
  paid: { bg: t.successLight, color: t.success },
  lost: { bg: t.rustLight, color: t.rust },
};

export function ReferralDetail({ referral, onEdit, onBack, onDelete }: ReferralDetailProps) {
  const sc = statusColors[referral.status] || { bg: t.goldLight, color: t.gold };

  const detailRow = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "2px" }}>{label}</span>
        <span style={{ ...t.body, color: t.text }}>{value}</span>
      </div>
    );
  };

  const stats = [
    { label: "Expected Commission", value: fmtDollars(referral.expectedCommission), color: t.textSecondary, icon: "payments" },
    { label: "Referral %", value: `${referral.referralPercent}%`, color: t.teal, icon: "percent" },
    { label: "Referral Fee", value: fmtDollars(referral.referralFee), color: t.gold, icon: "payments" },
  ];

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <div style={card}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: t.textTertiary,
          cursor: "pointer", padding: 0, fontFamily: t.font,
          display: "flex", alignItems: "center", gap: "6px",
          ...t.caption, marginBottom: "20px",
        }}>
          <Icon name="arrow_back" size={14} />
          Back to Referrals
        </button>

        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "4px" }}>{referral.clientName}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{
                padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em",
                background: sc.bg, color: sc.color,
              }}>
                {REFERRAL_STATUS_LABELS[referral.status as keyof typeof REFERRAL_STATUS_LABELS] ?? referral.status}
              </span>
              {referral.referralDate && (
                <span style={{ ...t.caption, color: t.textTertiary }}>
                  Referred {referral.referralDate}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onEdit} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", background: "transparent", border: `1px solid ${t.border}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: t.font,
              color: t.textSecondary,
            }}>
              <Icon name="edit" size={14} />
              Edit
            </button>
            <button onClick={() => onDelete(referral.id)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", background: "transparent", border: `1px solid ${t.rust}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: t.font,
              color: t.rust,
            }}>
              Delete
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-3col" style={{ marginBottom: "28px" }}>
          {stats.map(({ label, value, color, icon }) => (
            <div key={label} style={{ background: t.bg, padding: "16px", borderRadius: "10px" }}>
              <Icon name={icon} size={16} color={t.textTertiary} style={{ marginBottom: "8px" }} />
              <div style={{ ...t.stat, fontSize: "20px", color }}>{value}</div>
              <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Agent Info */}
        <div style={{ background: t.bg, borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <span style={{ ...t.eyebrow, color: t.teal, display: "block", marginBottom: "12px" }}>Receiving Agent</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="person" size={16} color={t.textTertiary} />
              <span style={{ ...t.body, color: t.text }}>{referral.agentName}</span>
            </div>
            {referral.agentEmail && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="mail" size={16} color={t.textTertiary} />
                <span style={{ ...t.body, color: t.text }}>{referral.agentEmail}</span>
              </div>
            )}
            {referral.agentPhone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="phone" size={16} color={t.textTertiary} />
                <span style={{ ...t.body, color: t.text }}>{referral.agentPhone}</span>
              </div>
            )}
          </div>
        </div>

        {detailRow("Referral Date", referral.referralDate)}

        {referral.notes && (
          <div style={{ marginTop: "8px" }}>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Notes</span>
            <p style={{ ...t.body, color: t.text }}>{referral.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

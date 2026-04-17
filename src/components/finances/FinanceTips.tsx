import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import {
  FINANCE_TIPS, TIP_CATEGORY_LABELS, QUARTERLY_TAX_DATES, MILEAGE_RATE,
  type TipCategory, type FinanceTip,
} from "@/constants/finance-tips";

const TAB_KEYS: TipCategory[] = ["deductions", "bestPractices", "commonMistakes", "taxCalendar"];

export function FinanceTips() {
  const [activeTab, setActiveTab] = useState<TipCategory>("deductions");
  const [openTips, setOpenTips] = useState<Record<string, boolean>>({});

  function toggleTip(id: string) {
    setOpenTips((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const renderTip = (tip: FinanceTip) => {
    const isOpen = openTips[tip.id] ?? false;
    return (
      <div key={tip.id} style={{
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: "12px", overflow: "hidden", marginBottom: "8px",
      }}>
        <button
          onClick={() => toggleTip(tip.id)}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            width: "100%", padding: "14px 16px",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: t.font, textAlign: "left",
          }}
        >
          <Icon name={tip.icon} size={18} color={t.teal} />
          <span style={{ flex: 1, fontWeight: 600, fontSize: "14px", color: t.text }}>
            {tip.title}
          </span>
          <Icon name={isOpen ? "expand_less" : "expand_more"} size={18} color={t.textTertiary} />
        </button>
        {isOpen && (
          <div style={{ padding: "0 16px 14px 46px" }}>
            <p style={{ ...t.body, color: t.textSecondary, margin: 0 }}>{tip.body}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
        BUSINESS FINANCES
      </span>
      <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "20px" }}>
        Tax Tips &amp; Best Practices
      </h2>

      {/* Mileage Rate Callout */}
      <div style={{
        ...card, padding: "14px 20px", marginBottom: "20px",
        background: t.tealLight, border: `1px solid rgba(79, 108, 75, 0.15)`,
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <Icon name="directions_car" size={20} color={t.teal} />
        <div>
          <span style={{ ...t.label, color: t.teal }}>IRS Standard Mileage Rate</span>
          <span style={{ ...t.body, color: t.text, display: "block" }}>
            ${MILEAGE_RATE}/mile for 2024. Track every business mile!
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "20px",
        background: t.surfaceContainerLow, borderRadius: "12px", padding: "4px",
      }}>
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1, padding: "10px 8px", border: "none", borderRadius: "8px",
              background: activeTab === key ? t.surface : "transparent",
              color: activeTab === key ? t.teal : t.textTertiary,
              fontWeight: activeTab === key ? 600 : 400,
              fontSize: "13px", fontFamily: t.font, cursor: "pointer",
              boxShadow: activeTab === key ? t.cardShadow : "none",
              transition: "all 0.15s",
            }}
          >
            {TIP_CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Tips Accordion */}
      <div>
        {FINANCE_TIPS[activeTab].map((tip) => renderTip(tip))}
      </div>

      {/* Quarterly Tax Calendar Card */}
      {activeTab === "taxCalendar" && (
        <div style={{ ...card, marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Icon name="event" size={20} color={t.teal} />
            <span style={{ ...t.sectionHeader, color: t.text }}>Quarterly Payment Schedule</span>
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {QUARTERLY_TAX_DATES.map((q) => (
              <div key={q.quarter} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 14px", background: t.bg, borderRadius: "8px",
              }}>
                <span style={{
                  padding: "4px 10px", borderRadius: "6px", fontWeight: 700,
                  fontSize: "12px", background: t.tealLight, color: t.teal,
                }}>
                  {q.quarter}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ ...t.body, color: t.text, fontWeight: 600 }}>{q.deadline}</span>
                  <span style={{ ...t.caption, color: t.textTertiary, display: "block" }}>{q.period}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "16px", padding: "12px 14px", borderRadius: "8px",
            background: t.goldLight,
          }}>
            <span style={{ ...t.body, color: t.gold }}>
              Set aside 25–30% of every commission check for taxes. Keep it in a separate savings account so you're never scrambling at payment time.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

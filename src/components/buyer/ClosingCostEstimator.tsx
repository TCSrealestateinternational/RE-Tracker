import { useState, useMemo } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, inputBase, btnSecondary } from "@/styles/theme";
import type { LoanType, ClosingCostLineItem } from "@/types";

interface ClosingCostEstimatorProps {
  defaultPurchasePrice: number;
  loanType?: LoanType;
}

const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: "conventional", label: "Conventional" },
  { value: "fha", label: "FHA" },
  { value: "va", label: "VA" },
  { value: "usda", label: "USDA" },
];

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function ClosingCostEstimator({ defaultPurchasePrice, loanType: initialLoanType = "conventional" }: ClosingCostEstimatorProps) {
  const [purchasePrice, setPurchasePrice] = useState(defaultPurchasePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanType, setLoanType] = useState<LoanType>(initialLoanType);

  const { lineItems, totalClosingCosts, downPaymentAmount, totalCashNeeded } = useMemo(() => {
    const loanAmount = purchasePrice * (1 - downPaymentPct / 100);

    const items: ClosingCostLineItem[] = [
      { label: "Loan Origination Fee", amount: loanAmount * 0.01, isPercentage: true, percentValue: 1.0 },
      { label: "Appraisal Fee", amount: 500, isPercentage: false },
      { label: "Home Inspection", amount: 400, isPercentage: false },
      { label: "Title Search & Insurance", amount: purchasePrice * 0.005, isPercentage: true, percentValue: 0.5 },
      { label: "Recording Fees", amount: 125, isPercentage: false },
      { label: "Survey Fee", amount: 350, isPercentage: false },
      { label: "Attorney Fees", amount: 750, isPercentage: false },
      { label: "Prepaid Homeowners Insurance", amount: purchasePrice * 0.003, isPercentage: true, percentValue: 0.3 },
      { label: "Prepaid Property Taxes (3 mo)", amount: purchasePrice * 0.0075, isPercentage: true, percentValue: 0.75 },
      { label: "Prepaid Interest (15 days)", amount: loanAmount * (interestRate / 100 / 365) * 15, isPercentage: false },
    ];

    if (loanType === "fha") {
      items.push({ label: "FHA Upfront MIP (1.75%)", amount: loanAmount * 0.0175, isPercentage: true, percentValue: 1.75 });
    }
    if (loanType === "va") {
      items.push({ label: "VA Funding Fee (2.15%)", amount: loanAmount * 0.0215, isPercentage: true, percentValue: 2.15 });
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const dp = purchasePrice * (downPaymentPct / 100);
    return {
      lineItems: items,
      totalClosingCosts: total,
      downPaymentAmount: dp,
      totalCashNeeded: dp + total,
    };
  }, [purchasePrice, downPaymentPct, interestRate, loanType]);

  const inputRow: React.CSSProperties = {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px",
  };
  const labelStyle: React.CSSProperties = {
    ...t.label, color: t.textSecondary, marginBottom: "4px", display: "block",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Icon name="calculate" size={20} color={t.teal} />
        <span style={{ ...t.sectionHeader, color: t.text }}>Closing Cost Estimator</span>
      </div>

      {/* Inputs */}
      <div style={{ background: t.bg, borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
        <div style={inputRow}>
          <div>
            <label style={labelStyle}>Purchase Price</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
              style={inputBase}
            />
          </div>
          <div>
            <label style={labelStyle}>Down Payment %</label>
            <input
              type="number"
              value={downPaymentPct}
              min={0} max={100} step={0.5}
              onChange={(e) => setDownPaymentPct(Number(e.target.value) || 0)}
              style={inputBase}
            />
            <span style={{ ...t.caption, color: t.textTertiary, marginTop: "2px", display: "block" }}>
              {fmtDollars(downPaymentAmount)}
            </span>
          </div>
        </div>
        <div style={inputRow}>
          <div>
            <label style={labelStyle}>Interest Rate %</label>
            <input
              type="number"
              value={interestRate}
              min={0} max={20} step={0.125}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
              style={inputBase}
            />
          </div>
          <div>
            <label style={labelStyle}>Loan Type</label>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {LOAN_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  onClick={() => setLoanType(lt.value)}
                  style={{
                    ...btnSecondary,
                    padding: "6px 12px", fontSize: "12px",
                    background: loanType === lt.value ? t.teal : "transparent",
                    color: loanType === lt.value ? t.textInverse : t.textSecondary,
                    border: loanType === lt.value ? "none" : `1px solid ${t.borderMedium}`,
                  }}
                >
                  {lt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div style={{ marginBottom: "16px" }}>
        {lineItems.map((item, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 0", borderBottom: `1px solid ${t.border}`,
          }}>
            <span style={{ ...t.body, color: t.text }}>
              {item.label}
              {item.isPercentage && item.percentValue && (
                <span style={{ ...t.caption, color: t.textTertiary, marginLeft: "6px" }}>
                  ({item.percentValue}%)
                </span>
              )}
            </span>
            <span style={{ ...t.body, fontWeight: 600, color: t.text }}>
              {fmtDollars(Math.round(item.amount))}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: t.goldLight, borderRadius: "8px", padding: "16px",
        border: `1px solid rgba(154, 101, 52, 0.15)`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ ...t.body, color: t.textSecondary }}>Total Closing Costs</span>
          <span style={{ ...t.body, fontWeight: 600, color: t.gold }}>{fmtDollars(Math.round(totalClosingCosts))}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ ...t.body, color: t.textSecondary }}>Down Payment</span>
          <span style={{ ...t.body, fontWeight: 600, color: t.text }}>{fmtDollars(Math.round(downPaymentAmount))}</span>
        </div>
        <div style={{ borderTop: `1px solid rgba(154, 101, 52, 0.2)`, paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ ...t.sectionHeader, color: t.text }}>Total Cash Needed</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: t.gold, fontFamily: t.fontHeadline, fontStyle: "italic" }}>
            {fmtDollars(Math.round(totalCashNeeded))}
          </span>
        </div>
      </div>

      <p style={{ ...t.caption, color: t.textTertiary, marginTop: "12px" }}>
        These are estimates only. Actual closing costs may vary based on lender, location, and transaction details.
      </p>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import type { ExpenseCategory } from "@/types";

interface ExpenseSummaryWidgetProps {
  totalExpenses: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
}

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function ExpenseSummaryWidget({ totalExpenses, expensesByCategory }: ExpenseSummaryWidgetProps) {
  const navigate = useNavigate();

  // Top 3 categories by spend
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Icon name="account_balance" size={16} color={t.textTertiary} />
            <span style={{ ...t.label, color: t.textSecondary }}>YTD Expenses</span>
          </div>
          <div style={{ ...t.stat, fontSize: "28px", color: t.teal }}>{fmtDollars(totalExpenses)}</div>
        </div>
        <button
          onClick={() => navigate("/finances")}
          style={{
            padding: "6px 12px", background: t.tealLight, border: "none",
            borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            fontFamily: t.font, color: t.teal, cursor: "pointer",
          }}
        >
          Track Expense
        </button>
      </div>

      {topCategories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {topCategories.map(([cat, amount]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...t.caption, color: t.textTertiary }}>{cat}</span>
              <span style={{ ...t.caption, fontWeight: 600, color: t.text }}>{fmtDollars(amount)}</span>
            </div>
          ))}
        </div>
      )}

      {topCategories.length === 0 && (
        <p style={{ ...t.caption, color: t.textTertiary, margin: 0 }}>
          No expenses tracked yet this year.
        </p>
      )}
    </div>
  );
}

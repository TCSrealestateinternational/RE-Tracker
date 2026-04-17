import { Icon } from "@/components/shared/Icon";
import { t, card, btnPrimary } from "@/styles/theme";
import type { Expense, ExpenseCategory } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  onSelect: (expense: Expense) => void;
  onAdd: () => void;
  isMileage?: boolean;
  totalExpenses: number;
  totalMileage: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
}

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  "Vehicle & Mileage": { bg: "rgba(79, 108, 75, 0.06)", color: "#4f6c4b" },
  "Marketing & Advertising": { bg: "rgba(174, 64, 37, 0.08)", color: "#ae4025" },
  "Licensing & Dues": { bg: "rgba(110, 99, 83, 0.08)", color: "#6e6353" },
  "Technology & Equipment": { bg: "rgba(79, 108, 75, 0.06)", color: "#4f6c4b" },
  "Education & Training": { bg: "rgba(45, 122, 79, 0.08)", color: "#1d6640" },
  "Home Office": { bg: "rgba(110, 99, 83, 0.08)", color: "#6e6353" },
  "Insurance": { bg: "rgba(174, 64, 37, 0.08)", color: "#ae4025" },
  "Client Meals & Gifts": { bg: "rgba(79, 108, 75, 0.06)", color: "#4f6c4b" },
  "Professional Services": { bg: "rgba(45, 122, 79, 0.08)", color: "#1d6640" },
  "Office & Desk Fees": { bg: "rgba(110, 99, 83, 0.08)", color: "#6e6353" },
  "Commission Splits": { bg: "rgba(174, 64, 37, 0.08)", color: "#ae4025" },
  "Retirement Contributions": { bg: "rgba(45, 122, 79, 0.08)", color: "#1d6640" },
  "Other": { bg: "rgba(110, 99, 83, 0.08)", color: "#6e6353" },
};

export function ExpenseList({
  expenses, onSelect, onAdd, isMileage,
  totalExpenses, totalMileage, expensesByCategory,
}: ExpenseListProps) {
  // Top category by spend
  const topCategory = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  const filtered = expenses.filter((e) =>
    isMileage ? e.type === "mileage" : e.type === "expense"
  );

  return (
    <div>
      <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
        BUSINESS FINANCES
      </span>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...t.pageTitle, color: t.text }}>
          {isMileage ? "Mileage Log" : "Expenses"}
        </h2>
        <button onClick={onAdd} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon name={isMileage ? "directions_car" : "add"} size={16} />
          {isMileage ? "Log Mileage" : "Add Expense"}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid-3col" style={{ marginBottom: "24px" }}>
        <div style={{ ...card, padding: "16px" }}>
          <Icon name="payments" size={16} color={t.textTertiary} style={{ marginBottom: "8px" }} />
          <div style={{ ...t.stat, fontSize: "20px", color: t.teal }}>{fmtDollars(totalExpenses)}</div>
          <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>YTD Total</div>
        </div>
        <div style={{ ...card, padding: "16px" }}>
          <Icon name="directions_car" size={16} color={t.textTertiary} style={{ marginBottom: "8px" }} />
          <div style={{ ...t.stat, fontSize: "20px", color: t.teal }}>
            {totalMileage.toLocaleString()} mi
          </div>
          <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>YTD Mileage</div>
        </div>
        <div style={{ ...card, padding: "16px" }}>
          <Icon name="category" size={16} color={t.textTertiary} style={{ marginBottom: "8px" }} />
          <div style={{ ...t.stat, fontSize: "16px", color: t.gold }}>
            {topCategory ? topCategory[0] : "—"}
          </div>
          <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Top Category</div>
        </div>
      </div>

      {/* Expense Rows */}
      <div style={{ display: "grid", gap: "8px" }}>
        {filtered.map((exp) => {
          const cc = categoryColors[exp.category] || { bg: t.goldLight, color: t.gold };
          return (
            <div
              key={exp.id}
              style={{
                ...card,
                display: "flex", alignItems: "center", gap: "12px",
                padding: "16px 20px", marginBottom: "0",
                cursor: "pointer", transition: "background 0.12s", fontFamily: t.font,
              }}
              onClick={() => onSelect(exp)}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: t.text }}>{exp.description}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    background: cc.bg, color: cc.color,
                  }}>
                    {exp.category}
                  </span>
                </div>
                <div style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
                  {exp.date}
                  {exp.type === "mileage" && exp.miles != null && <> &middot; {exp.roundTrip ? (exp.miles * 2) : exp.miles} mi</>}
                  {exp.destination && <> &middot; {exp.destination}</>}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontFamily: t.fontHeadline, fontStyle: "italic", fontSize: "16px", color: t.teal }}>
                  {fmtDollars(exp.amount)}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ ...t.body, color: t.textTertiary, marginBottom: "4px" }}>
              {isMileage ? "No mileage entries yet." : "No expenses yet."}
            </p>
            <p style={{ ...t.caption, color: t.textTertiary }}>
              {isMileage
                ? "Log your business miles to maximize your tax deduction."
                : "Track business expenses to see where your money goes and save on taxes."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

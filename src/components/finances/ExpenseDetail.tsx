import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import { useDeals } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import type { Expense } from "@/types";

interface ExpenseDetailProps {
  expense: Expense;
  onEdit: () => void;
  onBack: () => void;
  onDelete: (id: string) => Promise<void>;
}

function fmtDollars(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ExpenseDetail({ expense, onEdit, onBack, onDelete }: ExpenseDetailProps) {
  const { deals } = useDeals();
  const { clients } = useClients();

  const linkedDeal = expense.dealId ? deals.find((d) => d.id === expense.dealId) : null;
  const linkedClient = expense.clientId ? clients.find((c) => c.id === expense.clientId) : null;
  const isMileage = expense.type === "mileage";

  const stats = isMileage
    ? [
        { label: "Deduction", value: fmtDollars(expense.amount), color: t.teal, icon: "payments" },
        { label: "Miles", value: `${expense.roundTrip && expense.miles ? expense.miles * 2 : expense.miles || 0} mi`, color: t.textSecondary, icon: "directions_car" },
        { label: "Rate", value: `$${expense.mileageRate?.toFixed(3) ?? "—"}/mi`, color: t.gold, icon: "speed" },
      ]
    : [
        { label: "Amount", value: fmtDollars(expense.amount), color: t.teal, icon: "payments" },
        { label: "Category", value: expense.category, color: t.gold, icon: "category" },
        { label: "Date", value: expense.date, color: t.textSecondary, icon: "calendar_today" },
      ];

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
      <div style={card}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: t.textTertiary,
          cursor: "pointer", padding: 0, fontFamily: t.font,
          display: "flex", alignItems: "center", gap: "6px",
          ...t.caption, marginBottom: "20px",
        }}>
          <Icon name="arrow_back" size={14} />
          Back to {isMileage ? "Mileage" : "Expenses"}
        </button>

        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ ...t.pageTitle, color: t.text, marginBottom: "4px" }}>{expense.description}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{
                padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em",
                background: t.tealLight, color: t.teal,
              }}>
                {isMileage ? "Mileage" : "Expense"}
              </span>
              <span style={{ ...t.caption, color: t.textTertiary }}>{expense.date}</span>
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
            <button onClick={() => onDelete(expense.id)} style={{
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

        {/* Detail Rows */}
        <div style={{ background: t.bg, borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <span style={{ ...t.eyebrow, color: t.teal, display: "block", marginBottom: "12px" }}>Details</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {detailRow("Category", expense.category)}
            {isMileage && detailRow("Destination", expense.destination)}
            {isMileage && detailRow("Round Trip", expense.roundTrip ? "Yes" : "No")}
            {isMileage && expense.miles != null && detailRow("One-Way Miles", String(expense.miles))}
            {linkedDeal && detailRow("Linked Deal", `${linkedDeal.clientName} — ${linkedDeal.stage}`)}
            {linkedClient && detailRow("Linked Client", linkedClient.name)}
            {detailRow("Receipt", expense.hasReceipt ? "Yes" : "No")}
          </div>
        </div>

        {expense.notes && (
          <div style={{ marginTop: "8px" }}>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "4px" }}>Notes</span>
            <p style={{ ...t.body, color: t.text }}>{expense.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseList } from "@/components/finances/ExpenseList";
import { ExpenseForm } from "@/components/finances/ExpenseForm";
import { ExpenseDetail } from "@/components/finances/ExpenseDetail";
import { FinanceTips } from "@/components/finances/FinanceTips";
import { t } from "@/styles/theme";
import type { Expense } from "@/types";

type View = "list" | "add" | "detail" | "edit" | "mileage-add";
type Tab = "expenses" | "mileage" | "tips";

export function FinancesPage() {
  const {
    expenses, addExpense, updateExpense, deleteExpense,
    totalExpenses, totalMileage, expensesByCategory,
  } = useExpenses();

  const [view, setView] = useState<View>("list");
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [selected, setSelected] = useState<Expense | null>(null);

  // ── Form views ──
  if (view === "add") {
    return (
      <ExpenseForm
        type="expense"
        onSubmit={async (data) => { await addExpense(data); setView("list"); }}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "mileage-add") {
    return (
      <ExpenseForm
        type="mileage"
        onSubmit={async (data) => { await addExpense(data); setActiveTab("mileage"); setView("list"); }}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "edit" && selected) {
    return (
      <ExpenseForm
        type={selected.type}
        initial={selected}
        onSubmit={async (data) => {
          await updateExpense(selected.id, data);
          setSelected({ ...selected, ...data } as Expense);
          setView("detail");
        }}
        onCancel={() => setView("detail")}
      />
    );
  }

  if (view === "detail" && selected) {
    return (
      <ExpenseDetail
        expense={selected}
        onEdit={() => setView("edit")}
        onBack={() => { setSelected(null); setView("list"); }}
        onDelete={async (id) => {
          await deleteExpense(id);
          setSelected(null);
          setView("list");
        }}
      />
    );
  }

  // ── Tab bar + list views ──
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "expenses", label: "Expenses", icon: "receipt_long" },
    { key: "mileage", label: "Mileage", icon: "directions_car" },
    { key: "tips", label: "Tips", icon: "lightbulb" },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "24px",
        background: t.surfaceContainerLow, borderRadius: "12px", padding: "4px",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: "10px 12px", border: "none", borderRadius: "8px",
              background: activeTab === tab.key ? t.surface : "transparent",
              color: activeTab === tab.key ? t.teal : t.textTertiary,
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: "14px", fontFamily: t.font, cursor: "pointer",
              boxShadow: activeTab === tab.key ? t.cardShadow : "none",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "expenses" && (
        <ExpenseList
          expenses={expenses}
          onSelect={(e) => { setSelected(e); setView("detail"); }}
          onAdd={() => setView("add")}
          totalExpenses={totalExpenses}
          totalMileage={totalMileage}
          expensesByCategory={expensesByCategory}
        />
      )}

      {activeTab === "mileage" && (
        <ExpenseList
          expenses={expenses}
          onSelect={(e) => { setSelected(e); setView("detail"); }}
          onAdd={() => setView("mileage-add")}
          isMileage
          totalExpenses={totalExpenses}
          totalMileage={totalMileage}
          expensesByCategory={expensesByCategory}
        />
      )}

      {activeTab === "tips" && <FinanceTips />}
    </div>
  );
}

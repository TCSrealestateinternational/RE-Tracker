import { CHECKLIST_ITEMS, type TransactionChecklist, type ChecklistItemKey } from "@/types";
import { theme } from "@/styles/theme";

interface ChecklistViewProps {
  checklist: TransactionChecklist;
  clientName: string;
  onToggle: (checklistId: string, checklist: TransactionChecklist, key: ChecklistItemKey) => void;
}

export function ChecklistView({ checklist, clientName, onToggle }: ChecklistViewProps) {
  const completed = CHECKLIST_ITEMS.filter((k) => checklist.items[k]).length;
  const total = CHECKLIST_ITEMS.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div style={{
      background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal }}>{clientName}</h3>
        <span style={{
          fontSize: "0.8rem", fontWeight: 600,
          color: pct === 100 ? "#10b981" : theme.colors.gold,
        }}>
          {pct}% complete
        </span>
      </div>

      <div style={{
        height: "6px", background: theme.colors.gray100, borderRadius: "3px",
        overflow: "hidden", marginBottom: "1rem",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: pct === 100 ? "#10b981" : theme.colors.gold,
          borderRadius: "3px", transition: "width 0.3s",
        }} />
      </div>

      <div style={{ display: "grid", gap: "0.35rem" }}>
        {CHECKLIST_ITEMS.map((item) => {
          const checked = checklist.items[item];
          return (
            <label
              key={item}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 0.5rem", borderRadius: "6px", cursor: "pointer",
                background: checked ? "#f0fdf4" : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(checklist.id, checklist, item)}
                style={{ accentColor: theme.colors.teal, width: "16px", height: "16px" }}
              />
              <span style={{
                fontSize: "0.85rem",
                color: checked ? "#166534" : theme.colors.gray700,
                textDecoration: checked ? "line-through" : "none",
              }}>
                {item}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

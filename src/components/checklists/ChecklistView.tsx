import { CHECKLIST_ITEMS, type TransactionChecklist, type ChecklistItemKey } from "@/types";
import { t, card } from "@/styles/theme";

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
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h3 style={{ ...t.sectionHeader, color: t.text }}>{clientName}</h3>
        <span style={{
          ...t.caption, fontWeight: 600,
          color: pct === 100 ? t.success : t.textTertiary,
        }}>
          {pct}%
        </span>
      </div>

      <div style={{
        height: "3px", background: t.tealLight, borderRadius: "2px",
        overflow: "hidden", marginBottom: "20px",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: pct === 100 ? t.success : t.teal,
          borderRadius: "2px", transition: "width 0.3s",
        }} />
      </div>

      <div style={{ display: "grid", gap: "2px" }}>
        {CHECKLIST_ITEMS.map((item) => {
          const checked = checklist.items[item];
          return (
            <label
              key={item}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 10px", borderRadius: "6px", cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.bg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(checklist.id, checklist, item)}
                style={{ accentColor: t.teal, width: "15px", height: "15px", cursor: "pointer" }}
              />
              <span style={{
                ...t.body,
                color: checked ? t.textTertiary : t.text,
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

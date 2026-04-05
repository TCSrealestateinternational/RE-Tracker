import { Bell, BellOff } from "lucide-react";
import { BUYER_CHECKLIST_ITEMS, SELLER_CHECKLIST_ITEMS } from "@/types";
import type { TransactionChecklist } from "@/types";
import { getMilestoneMapping } from "@/constants/milestoneMap";
import { t, card } from "@/styles/theme";

interface ChecklistViewProps {
  checklist: TransactionChecklist;
  clientName: string;
  transactionId?: string;
  onToggle: (checklistId: string, checklist: TransactionChecklist, key: string, transactionId?: string) => void;
  onToggleNotify?: (checklistId: string, key: string, notify: boolean) => void;
}

export function ChecklistView({ checklist, clientName, transactionId, onToggle, onToggleNotify }: ChecklistViewProps) {
  const items = checklist.type === "buyer" ? BUYER_CHECKLIST_ITEMS : SELLER_CHECKLIST_ITEMS;
  const completed = items.filter((k) => checklist.items[k]).length;
  const total = items.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ ...t.sectionHeader, color: t.text }}>{clientName}</h3>
          <span style={{
            padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
            background: checklist.type === "buyer" ? t.tealLight : t.goldLight,
            color: checklist.type === "buyer" ? t.teal : t.gold,
            textTransform: "uppercase",
          }}>
            {checklist.type}
          </span>
        </div>
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
        {items.map((item) => {
          const checked = checklist.items[item] ?? false;
          const mapping = getMilestoneMapping(checklist.type, item);
          const notifyClient = checklist.notifications?.[item] ?? mapping?.defaultNotifyClient ?? false;

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
                onChange={() => onToggle(checklist.id, checklist, item, transactionId)}
                style={{ accentColor: t.teal, width: "15px", height: "15px", cursor: "pointer" }}
              />
              <span style={{
                ...t.body, flex: 1,
                color: checked ? t.textTertiary : t.text,
                textDecoration: checked ? "line-through" : "none",
              }}>
                {item}
              </span>
              {/* Bell icon for milestone-mapped items that are completed */}
              {mapping && checked && onToggleNotify && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleNotify(checklist.id, item, !notifyClient);
                  }}
                  title={notifyClient ? "Client will be notified" : "Client will not be notified"}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "2px", display: "flex", alignItems: "center",
                    color: notifyClient ? t.teal : t.textTertiary,
                    opacity: notifyClient ? 1 : 0.4,
                  }}
                >
                  {notifyClient ? <Bell size={14} strokeWidth={1.5} /> : <BellOff size={14} strokeWidth={1.5} />}
                </button>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

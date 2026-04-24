import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import type { TransactionChecklist } from "@/types";
import { BUYER_CHECKLIST_TEMPLATE, BUYER_STAGES } from "@/constants/checklist-buyer";
import { SELLER_CHECKLIST_TEMPLATE, SELLER_STAGES } from "@/constants/checklist-seller";
import type { ChecklistTemplateItem } from "@/constants/checklist-buyer";
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
  const isBuyer = checklist.type === "buyer";
  const template = isBuyer ? BUYER_CHECKLIST_TEMPLATE : SELLER_CHECKLIST_TEMPLATE;
  const stages = isBuyer ? BUYER_STAGES : SELLER_STAGES;
  const completed = template.filter((item) => checklist.items[item.label]).length;
  const total = template.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ ...t.sectionHeader, color: t.text }}>{clientName}</h3>
          <span style={{
            padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
            background: isBuyer ? t.tealLight : t.goldLight,
            color: isBuyer ? t.teal : t.gold,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {checklist.type}
          </span>
        </div>
        <span style={{
          ...t.caption, fontWeight: 600,
          color: pct === 100 ? t.success : t.textTertiary,
        }}>
          {completed}/{total} ({pct}%)
        </span>
      </div>

      <div style={{
        height: "4px", background: t.tealLight, borderRadius: "2px",
        overflow: "hidden", marginBottom: "20px",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: pct === 100 ? t.success : t.goldGradient,
          borderRadius: "2px", transition: "width 0.3s",
        }} />
      </div>

      <div style={{ display: "grid", gap: "4px" }}>
        {stages.map((stage) => {
          const stageItems = template.filter((item) => item.stage === stage);
          const stageCompleted = stageItems.filter((item) => checklist.items[item.label]).length;
          return (
            <StageSection
              key={stage}
              stage={stage}
              items={stageItems}
              completed={stageCompleted}
              checklist={checklist}
              transactionId={transactionId}
              onToggle={onToggle}
              onToggleNotify={onToggleNotify}
            />
          );
        })}
      </div>
    </div>
  );
}

function StageSection({
  stage,
  items,
  completed,
  checklist,
  transactionId,
  onToggle,
  onToggleNotify,
}: {
  stage: string;
  items: ChecklistTemplateItem[];
  completed: number;
  checklist: TransactionChecklist;
  transactionId?: string;
  onToggle: ChecklistViewProps["onToggle"];
  onToggleNotify?: ChecklistViewProps["onToggleNotify"];
}) {
  const allDone = completed === items.length;
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderRadius: "8px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "8px", width: "100%",
          background: t.bg, border: "none", cursor: "pointer",
          padding: "10px 12px", fontFamily: t.font,
        }}
      >
        <Icon name={open ? "expand_more" : "chevron_right"} size={14} color={t.textSecondary} />
        <span style={{
          ...t.label, flex: 1, textAlign: "left",
          color: allDone ? t.success : t.text,
          textDecoration: allDone ? "line-through" : "none",
        }}>
          {stage}
        </span>
        <span style={{
          ...t.caption, fontWeight: 600,
          color: allDone ? t.success : t.textTertiary,
        }}>
          {completed}/{items.length}
        </span>
      </button>

      {open && (
        <div style={{ padding: "2px 0 8px 12px" }}>
          {items.map((item) => {
            const checked = checklist.items[item.label] ?? false;
            const meta = checklist.itemMeta?.[item.label];
            const mapping = getMilestoneMapping(checklist.type, item.label);
            const notifyClient = checklist.notifications?.[item.label] ?? mapping?.defaultNotifyClient ?? false;

            return (
              <div key={item.id}>
                <label
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
                    onChange={() => onToggle(checklist.id, checklist, item.label, transactionId)}
                    style={{ accentColor: t.teal, width: "15px", height: "15px", cursor: "pointer" }}
                  />
                  <span style={{
                    ...t.body, flex: 1, minWidth: 0,
                    color: checked ? t.textTertiary : t.text,
                    textDecoration: checked ? "line-through" : "none",
                    wordBreak: "break-word",
                  }}>
                    {item.label}
                  </span>
                  {mapping && checked && onToggleNotify && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleNotify(checklist.id, item.label, !notifyClient);
                      }}
                      title={notifyClient ? "Client will be notified" : "Client will not be notified"}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: "2px", display: "flex", alignItems: "center",
                        color: notifyClient ? t.teal : t.textTertiary,
                        opacity: notifyClient ? 1 : 0.4,
                      }}
                    >
                      <Icon name={notifyClient ? "notifications" : "notifications_off"} size={14} />
                    </button>
                  )}
                </label>
                {checked && meta && (
                  <div style={{
                    marginLeft: "35px", marginBottom: "4px",
                    display: "flex", alignItems: "center", gap: "4px",
                    ...t.caption, fontSize: "11px", color: t.textTertiary,
                  }}>
                    <Icon name="person" size={11} color={t.textTertiary} />
                    <span>{meta.completedByName}</span>
                    <span style={{ margin: "0 2px" }}>&middot;</span>
                    <span>{new Date(meta.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

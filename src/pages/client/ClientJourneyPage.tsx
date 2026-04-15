import { useClientTransaction } from "@/hooks/useClientTransaction";
import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import { BUYER_CHECKLIST_TEMPLATE, BUYER_STAGES } from "@/constants/checklist-buyer";
import { SELLER_CHECKLIST_TEMPLATE, SELLER_STAGES } from "@/constants/checklist-seller";
import { useState } from "react";

export function ClientJourneyPage() {
  const { transaction, milestones, checklist, loading } = useClientTransaction();

  const isBuying = transaction?.type === "buying";
  const template = isBuying ? BUYER_CHECKLIST_TEMPLATE : SELLER_CHECKLIST_TEMPLATE;
  const stages = isBuying ? BUYER_STAGES : SELLER_STAGES;

  // Milestones timeline
  const visibleMilestones = milestones.filter((m) => m.clientVisible);
  const completedMilestones = visibleMilestones.filter((m) => m.completed);
  const progressPct = visibleMilestones.length > 0
    ? Math.round((completedMilestones.length / visibleMilestones.length) * 100)
    : 0;

  // Checklist progress
  const checklistCompleted = checklist
    ? template.filter((item) => checklist.items[item.label]).length
    : 0;
  const checklistTotal = template.length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  if (loading) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "32px" }}>
        <p style={{ ...t.body, color: t.textTertiary }}>Loading your journey...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "32px" }}>
        <Icon name="route" size={32} color={t.textTertiary} />
        <p style={{ ...t.body, color: t.textTertiary, marginTop: "12px" }}>
          Your journey will appear here once your agent sets up your transaction.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <section>
        <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "4px" }}>
          Your Journey
        </h1>
        <p style={{ ...t.body, color: t.textTertiary }}>
          {isBuying ? "Home buying" : "Home selling"} progress
        </p>
      </section>

      {/* Milestone Timeline */}
      {visibleMilestones.length > 0 && (
        <section style={card} aria-label="Milestones">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Icon name="flag" size={18} color={t.teal} />
            <h2 style={{ ...t.sectionHeader, color: t.text }}>Milestones</h2>
            <span style={{ ...t.caption, fontWeight: 600, color: t.textTertiary, marginLeft: "auto" }}>
              {completedMilestones.length}/{visibleMilestones.length} ({progressPct}%)
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: "3px",
            background: t.surfaceContainerHigh,
            borderRadius: "2px",
            overflow: "hidden",
            marginBottom: "20px",
          }}>
            <div
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: progressPct === 100 ? t.success : t.teal,
                borderRadius: "2px",
                transition: "width 0.3s",
              }}
            />
          </div>

          {/* Timeline */}
          <div style={{ display: "grid", gap: "0px", paddingLeft: "12px" }}>
            {visibleMilestones.map((milestone, i) => (
              <div
                key={milestone.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  paddingBottom: i < visibleMilestones.length - 1 ? "20px" : "0",
                  borderLeft: i < visibleMilestones.length - 1
                    ? `2px solid ${milestone.completed ? t.teal : t.outlineVariant}`
                    : "2px solid transparent",
                  paddingLeft: "16px",
                  marginLeft: "-1px",
                  position: "relative",
                }}
              >
                <div style={{
                  position: "absolute",
                  left: "-9px",
                  top: "0px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: milestone.completed ? t.teal : t.surface,
                  border: `2px solid ${milestone.completed ? t.teal : t.outlineVariant}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {milestone.completed && (
                    <Icon name="check" size={10} color={t.textInverse} />
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: "0px" }}>
                  <p style={{
                    ...t.body,
                    color: milestone.completed ? t.textTertiary : t.text,
                    fontWeight: milestone.completed ? 400 : 500,
                    textDecoration: milestone.completed ? "line-through" : "none",
                  }}>
                    {milestone.label}
                  </p>
                  <p style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
                    {milestone.stage}
                    {milestone.completed && milestone.completedAt && (
                      <> &middot; {new Date(milestone.completedAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Checklist */}
      {checklist && (
        <section style={card} aria-label="Transaction checklist">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Icon name="checklist" size={18} color={t.teal} />
            <h2 style={{ ...t.sectionHeader, color: t.text }}>Checklist</h2>
            <span style={{ ...t.caption, fontWeight: 600, color: checklistPct === 100 ? t.success : t.textTertiary, marginLeft: "auto" }}>
              {checklistCompleted}/{checklistTotal} ({checklistPct}%)
            </span>
          </div>

          <div style={{
            height: "3px",
            background: t.surfaceContainerHigh,
            borderRadius: "2px",
            overflow: "hidden",
            marginBottom: "16px",
          }}>
            <div
              role="progressbar"
              aria-valuenow={checklistPct}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                height: "100%",
                width: `${checklistPct}%`,
                background: checklistPct === 100 ? t.success : t.teal,
                borderRadius: "2px",
                transition: "width 0.3s",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "4px" }}>
            {stages.map((stage) => {
              const stageItems = template.filter((item) => item.stage === stage);
              const stageDone = stageItems.filter((item) => checklist.items[item.label]).length;
              return (
                <JourneyStageSection
                  key={stage}
                  stage={stage}
                  items={stageItems.map((item) => ({
                    label: item.label,
                    completed: checklist.items[item.label] ?? false,
                  }))}
                  completed={stageDone}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function JourneyStageSection({
  stage,
  items,
  completed,
}: {
  stage: string;
  items: { label: string; completed: boolean }[];
  completed: number;
}) {
  const allDone = completed === items.length;
  const [open, setOpen] = useState(!allDone);

  return (
    <div style={{ borderRadius: "12px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          background: t.surfaceContainerLow,
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          fontFamily: t.font,
        }}
      >
        <Icon name={open ? "expand_more" : "chevron_right"} size={14} color={t.textSecondary} />
        <span style={{
          ...t.label,
          flex: 1,
          textAlign: "left",
          color: allDone ? t.success : t.text,
          textDecoration: allDone ? "line-through" : "none",
        }}>
          {stage}
        </span>
        <span style={{
          ...t.caption,
          fontWeight: 600,
          color: allDone ? t.success : t.textTertiary,
        }}>
          {completed}/{items.length}
        </span>
      </button>
      {open && (
        <div style={{ padding: "4px 0 8px 12px" }}>
          {items.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
              }}
            >
              <Icon
                name={item.completed ? "check_circle" : "radio_button_unchecked"}
                size={16}
                color={item.completed ? t.success : t.outlineVariant}
              />
              <span style={{
                ...t.body,
                color: item.completed ? t.textTertiary : t.text,
                textDecoration: item.completed ? "line-through" : "none",
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

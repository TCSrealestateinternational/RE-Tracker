import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useAuth } from "@/context/AuthContext";
import { useMilestones } from "@/hooks/useMilestones";
import { t, card, btnPrimary, btnSecondary, inputBase } from "@/styles/theme";
import type { Milestone } from "@/types";

interface MilestoneManagerProps {
  transactionId: string;
  clientType: "buyer" | "seller";
}

const BUYER_STAGES = ["Getting Started", "Making an Offer", "Under Contract", "Closing"];
const SELLER_STAGES = ["Getting Started", "Marketing", "Offers", "Under Contract", "Closing"];

export function MilestoneManager({ transactionId, clientType }: MilestoneManagerProps) {
  const { user } = useAuth();
  const { milestones, loading, addMilestone, removeMilestone, toggleComplete, updateMilestone } = useMilestones(transactionId);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newStage, setNewStage] = useState("");
  const [newClientVisible, setNewClientVisible] = useState(true);
  const [adding, setAdding] = useState(false);

  const stages = clientType === "buyer" ? BUYER_STAGES : SELLER_STAGES;

  // Group milestones by stage
  const grouped = stages.map((stage) => ({
    stage,
    items: milestones.filter((m) => m.stage === stage),
  }));

  // Any milestones with stages not in our known list
  const knownStages = new Set(stages);
  const otherMilestones = milestones.filter((m) => !knownStages.has(m.stage));
  if (otherMilestones.length > 0) {
    grouped.push({ stage: "Other", items: otherMilestones });
  }

  async function handleAdd() {
    if (!newLabel.trim() || !newStage) return;
    setAdding(true);
    await addMilestone(transactionId, {
      label: newLabel.trim(),
      stage: newStage,
      completed: false,
      completedAt: null,
      completedBy: null,
      clientVisible: newClientVisible,
      notifyClient: false,
    });
    setNewLabel("");
    setNewStage("");
    setNewClientVisible(true);
    setShowAdd(false);
    setAdding(false);
  }

  async function handleToggleVisible(m: Milestone) {
    await updateMilestone(transactionId, m.id, { clientVisible: !m.clientVisible });
  }

  if (loading) {
    return (
      <div style={card}>
        <h3 style={{ ...t.sectionHeader, color: t.text }}>Milestones</h3>
        <p style={{ ...t.body, color: t.textTertiary, marginTop: "8px" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="flag" size={16} color={t.teal} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Milestones</h3>
          <span style={{ ...t.caption, color: t.textTertiary }}>
            {milestones.filter((m) => m.completed).length}/{milestones.length}
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "6px 12px", background: t.tealLight, border: "none",
            borderRadius: "8px", cursor: "pointer", fontSize: "12px",
            fontWeight: 600, fontFamily: t.font, color: t.teal,
          }}
        >
          <Icon name="add" size={14} />
          Add
        </button>
      </div>

      {/* Progress bar */}
      {milestones.length > 0 && (
        <div style={{
          height: "3px", background: t.tealLight, borderRadius: "2px",
          overflow: "hidden", marginBottom: "16px",
        }}>
          <div style={{
            height: "100%",
            width: `${Math.round((milestones.filter((m) => m.completed).length / milestones.length) * 100)}%`,
            background: t.teal, borderRadius: "2px", transition: "width 0.3s",
          }} />
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{
          background: t.bg, borderRadius: "10px", padding: "14px",
          marginBottom: "16px", border: `1px solid ${t.border}`,
        }}>
          <div style={{ display: "grid", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Milestone label"
              style={inputBase}
              autoFocus
            />
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              style={{ ...inputBase, cursor: "pointer" }}
            >
              <option value="">Select stage...</option>
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <label style={{
              display: "flex", alignItems: "center", gap: "8px",
              ...t.caption, color: t.textSecondary, cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={newClientVisible}
                onChange={(e) => setNewClientVisible(e.target.checked)}
                style={{ accentColor: t.teal }}
              />
              Visible to client
            </label>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowAdd(false)}
              style={{ ...btnSecondary, fontSize: "12px", padding: "6px 14px" }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !newLabel.trim() || !newStage}
              style={{
                ...btnPrimary, fontSize: "12px", padding: "6px 14px",
                opacity: adding || !newLabel.trim() || !newStage ? 0.6 : 1,
              }}
            >
              {adding ? "Adding..." : "Add Milestone"}
            </button>
          </div>
        </div>
      )}

      {/* Milestone groups */}
      {milestones.length === 0 ? (
        <p style={{ ...t.body, color: t.textTertiary }}>No milestones yet. Add one to get started.</p>
      ) : (
        <div style={{ display: "grid", gap: "4px" }}>
          {grouped.filter((g) => g.items.length > 0).map(({ stage, items }) => (
            <MilestoneStageGroup
              key={stage}
              stage={stage}
              items={items}
              transactionId={transactionId}
              userId={user?.uid || ""}
              onToggleComplete={toggleComplete}
              onToggleVisible={handleToggleVisible}
              onRemove={removeMilestone}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneStageGroup({
  stage,
  items,
  transactionId,
  userId,
  onToggleComplete,
  onToggleVisible,
  onRemove,
}: {
  stage: string;
  items: Milestone[];
  transactionId: string;
  userId: string;
  onToggleComplete: (txId: string, m: Milestone, userId: string) => Promise<void>;
  onToggleVisible: (m: Milestone) => Promise<void>;
  onRemove: (txId: string, mId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const done = items.filter((m) => m.completed).length;
  const allDone = done === items.length;

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
        }}>
          {stage}
        </span>
        <span style={{ ...t.caption, fontWeight: 600, color: allDone ? t.success : t.textTertiary }}>
          {done}/{items.length}
        </span>
      </button>

      {open && (
        <div style={{ padding: "2px 0 8px 12px" }}>
          {items.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 10px", borderRadius: "6px",
              }}
            >
              <input
                type="checkbox"
                checked={m.completed}
                onChange={() => onToggleComplete(transactionId, m, userId)}
                style={{ accentColor: t.teal, width: "15px", height: "15px", cursor: "pointer" }}
              />
              <span style={{
                ...t.body, flex: 1,
                color: m.completed ? t.textTertiary : t.text,
                textDecoration: m.completed ? "line-through" : "none",
              }}>
                {m.label}
              </span>

              {/* Visibility toggle */}
              <button
                onClick={() => onToggleVisible(m)}
                title={m.clientVisible ? "Visible to client" : "Hidden from client"}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "2px", display: "flex", color: m.clientVisible ? t.teal : t.textTertiary,
                }}
              >
                <Icon name={m.clientVisible ? "visibility" : "visibility_off"} size={14} />
              </button>

              {/* Remove */}
              <button
                onClick={() => onRemove(transactionId, m.id)}
                title="Remove milestone"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "2px", display: "flex", color: t.textTertiary,
                }}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

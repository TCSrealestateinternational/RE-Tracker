import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, inputBase, btnPrimary } from "@/styles/theme";
import { useWishList } from "@/hooks/useWishList";
import type { WishListPriority } from "@/types";

interface HomeWishListProps {
  transactionId: string;
  clientId: string;
}

const PRIORITIES: { value: WishListPriority; label: string; color: string; bg: string; icon: string }[] = [
  { value: "must-have", label: "Must-Have", color: t.teal, bg: t.tealLight, icon: "star" },
  { value: "nice-to-have", label: "Nice-to-Have", color: t.gold, bg: t.goldLight, icon: "thumb_up" },
  { value: "dealbreaker", label: "Dealbreaker", color: t.rust, bg: t.rustLight, icon: "block" },
];

export function HomeWishList({ transactionId, clientId }: HomeWishListProps) {
  const { items, loading, addItem, removeItem } = useWishList(transactionId);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<WishListPriority>("must-have");

  // suppress unused-var warning — clientId is used for permission context
  void clientId;

  async function handleAdd() {
    const text = newText.trim();
    if (!text) return;
    await addItem(text, newPriority);
    setNewText("");
  }

  if (loading) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Icon name="checklist" size={20} color={t.teal} />
          <span style={{ ...t.sectionHeader, color: t.text }}>Home Wish List</span>
        </div>
        <div style={{ ...t.body, color: t.textTertiary }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Icon name="checklist" size={20} color={t.teal} />
        <span style={{ ...t.sectionHeader, color: t.text }}>Home Wish List</span>
        {items.length > 0 && (
          <span style={{ ...t.caption, fontWeight: 600, color: t.textTertiary, background: t.bg, padding: "2px 8px", borderRadius: "4px" }}>
            {items.length} items
          </span>
        )}
      </div>

      {/* Add Form */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="e.g., 3+ bedrooms, fenced yard..."
          style={{ ...inputBase, flex: 1, minWidth: "180px" }}
        />
        <button onClick={handleAdd} disabled={!newText.trim()} style={{ ...btnPrimary, opacity: newText.trim() ? 1 : 0.5 }}>
          Add
        </button>
      </div>

      {/* Priority Toggle */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            onClick={() => setNewPriority(p.value)}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
              fontFamily: t.font, cursor: "pointer",
              background: newPriority === p.value ? p.color : "transparent",
              color: newPriority === p.value ? t.textInverse : p.color,
              border: newPriority === p.value ? "none" : `1px solid ${p.color}`,
            }}
          >
            <Icon name={p.icon} size={14} color={newPriority === p.value ? t.textInverse : p.color} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Category Sections */}
      {PRIORITIES.map((p) => {
        const categoryItems = items.filter((i) => i.priority === p.value);
        return (
          <div key={p.value} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Icon name={p.icon} size={16} color={p.color} />
              <span style={{ ...t.label, color: p.color }}>{p.label}</span>
              <span style={{ ...t.caption, color: t.textTertiary }}>({categoryItems.length})</span>
            </div>
            {categoryItems.length === 0 ? (
              <div style={{ ...t.caption, color: t.textTertiary, padding: "8px 0", fontStyle: "italic" }}>
                No items yet
              </div>
            ) : (
              categoryItems.map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", marginBottom: "4px", borderRadius: "6px",
                  background: p.bg, border: `1px solid ${t.border}`,
                }}>
                  <span style={{ ...t.body, color: t.text }}>{item.text}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex" }}
                    aria-label={`Remove ${item.text}`}
                  >
                    <Icon name="close" size={16} color={t.textTertiary} />
                  </button>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

import { theme } from "@/styles/theme";
import type { Client } from "@/types";

interface ClientListProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onAdd: () => void;
}

export function ClientList({ clients, onSelect, onAdd }: ClientListProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: theme.colors.teal }}>Clients</h2>
        <button onClick={onAdd} style={{
          padding: "0.5rem 1rem", background: theme.colors.teal, color: theme.colors.white,
          border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
        }}>
          + Add Client
        </button>
      </div>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {clients.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: theme.colors.white, border: `1px solid ${theme.colors.gray200}`,
              borderRadius: "8px", padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left", width: "100%",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: theme.colors.gray900 }}>{c.name}</div>
              <div style={{ fontSize: "0.8rem", color: theme.colors.gray500 }}>
                {c.status} &middot; {c.stage}
              </div>
            </div>
            {c.commissionEarned > 0 && (
              <span style={{ color: theme.colors.gold, fontWeight: 600 }}>
                ${c.commissionEarned.toLocaleString()}
              </span>
            )}
          </button>
        ))}
        {clients.length === 0 && (
          <p style={{ color: theme.colors.gray500, textAlign: "center", padding: "2rem" }}>
            No clients yet. Add your first client to get started.
          </p>
        )}
      </div>
    </div>
  );
}

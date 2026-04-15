import { t } from "@/styles/theme";
import { Icon } from "@/components/shared/Icon";
import { PERMISSION_LABELS } from "@/constants/permissionDefaults";
import type { PermissionChangeEntry, SyncPermissionKey } from "@/types";

interface PermissionHistoryProps {
  entries: PermissionChangeEntry[];
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function describeAction(entry: PermissionChangeEntry): string {
  switch (entry.action) {
    case "invite_sent":
      return "Invite sent to client";
    case "invite_accepted":
      return "Client accepted invite";
    case "sync_paused":
      return "Sync paused";
    case "sync_resumed":
      return "Sync resumed";
    case "permission_updated": {
      const fieldLabel = entry.field
        ? PERMISSION_LABELS[entry.field as SyncPermissionKey]?.label || entry.field
        : "permission";
      return `${fieldLabel} ${entry.newValue ? "enabled" : "disabled"}`;
    }
    default:
      return entry.action;
  }
}

function actionIcon(action: string): string {
  switch (action) {
    case "invite_sent": return "send";
    case "invite_accepted": return "check_circle";
    case "sync_paused": return "pause_circle";
    case "sync_resumed": return "play_circle";
    case "permission_updated": return "tune";
    default: return "info";
  }
}

export function PermissionHistory({ entries }: PermissionHistoryProps) {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  if (sorted.length === 0) {
    return (
      <p style={{ ...t.caption, color: t.textTertiary, fontStyle: "italic" }}>
        No permission changes recorded yet.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: "2px" }}>
      {sorted.map((entry, i) => (
        <div
          key={`${entry.timestamp}-${i}`}
          style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "8px 10px", borderRadius: "6px",
          }}
        >
          <Icon name={actionIcon(entry.action)} size={14} color={t.textTertiary} style={{ marginTop: "2px", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...t.body, color: t.text, fontSize: "13px" }}>
              {describeAction(entry)}
            </span>
            <span style={{ ...t.caption, color: t.textTertiary, display: "block", marginTop: "1px" }}>
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
